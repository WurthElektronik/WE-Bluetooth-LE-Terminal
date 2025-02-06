import type { CapacitorElectronConfig } from '@capacitor-community/electron';
import { getCapacitorElectronConfig, setupElectronDeepLinking } from '@capacitor-community/electron';
import type { MenuItemConstructorOptions } from 'electron';
import { app, MenuItem, ipcMain, shell } from 'electron';
import electronIsDev from 'electron-is-dev';
import unhandled from 'electron-unhandled';
import { autoUpdater } from 'electron-updater';

import { ElectronCapacitorApp, setupContentSecurityPolicy, setupReloadWatcher } from './setup';
import { ipcRenderer } from 'electron/renderer';

// Graceful handling of unhandled errors.
unhandled();

var BluetoothDeviceSelectCallback = null;

// Define our menu templates (these are optional)
const trayMenuTemplate: (MenuItemConstructorOptions | MenuItem)[] = [new MenuItem({ label: 'Quit App', role: 'quit' })];
const appMenuBarMenuTemplate: (MenuItemConstructorOptions | MenuItem)[] = [
  { role: process.platform === 'darwin' ? 'appMenu' : 'fileMenu' },
  { role: 'viewMenu' },
];

// Get Config options from capacitor.config
const capacitorFileConfig: CapacitorElectronConfig = getCapacitorElectronConfig();

// Initialize our app. You can pass menu templates into the app here.
// const myCapacitorApp = new ElectronCapacitorApp(capacitorFileConfig);
const myCapacitorApp = new ElectronCapacitorApp(capacitorFileConfig, undefined, undefined);

// If deeplinking is enabled then we will set it up here.
if (capacitorFileConfig.electron?.deepLinkingEnabled) {
  setupElectronDeepLinking(myCapacitorApp, {
    customProtocol: capacitorFileConfig.electron.deepLinkingCustomProtocol ?? 'mycapacitorapp',
  });
}

// If we are in Dev mode, use the file watcher components.
if (electronIsDev) {
  setupReloadWatcher(myCapacitorApp);
}

// Run Application
(async () => {
  // Wait for electron app to be ready.
  await app.whenReady();
  // Security - Set Content-Security-Policy based on whether or not we are in dev mode.
  setupContentSecurityPolicy(myCapacitorApp.getCustomURLScheme());
  // Initialize our app, build windows, and load content.
  await myCapacitorApp.init();
  // Check for updates if we are in a packaged app.
 // autoUpdater.checkForUpdatesAndNotify();

  myCapacitorApp.getSelectBluetoothDeviceWindow().on('close',(event) =>{
    event.preventDefault();
    myCapacitorApp.getSelectBluetoothDeviceWindow().hide();
    if(BluetoothDeviceSelectCallback){
      BluetoothDeviceSelectCallback("");
    }
    BluetoothDeviceSelectCallback = null;
    myCapacitorApp.getMainWindow().webContents.send('scan-cancelled');
  });
  
  myCapacitorApp.getMainWindow().webContents.on('select-bluetooth-device', (event, deviceList, callback) => {
    event.preventDefault();
    myCapacitorApp.getSelectBluetoothDeviceWindow().webContents.send('device-scanned',deviceList);
    BluetoothDeviceSelectCallback = callback
  });

  myCapacitorApp.getMainWindow().webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' }
  })

})();

// Handle when all of our windows are close (platforms have their own expectations).
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// When the dock icon is clicked.
app.on('activate', async function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (myCapacitorApp.getMainWindow().isDestroyed()) {
    await myCapacitorApp.init();
  }
});

// Place all ipc or other electron api calls and custom functionality under this line
ipcMain.on('device-selected', (event, id) => {
  myCapacitorApp.getSelectBluetoothDeviceWindow().hide();
  BluetoothDeviceSelectCallback(id);
  BluetoothDeviceSelectCallback = null;
});

ipcMain.on('scan-start', (event) => {
  myCapacitorApp.getSelectBluetoothDeviceWindow().webContents.send('clear-scan');
  let [mainWindowWidth, mainWindowHeight] = myCapacitorApp.getMainWindow().getContentSize();
  let [mainWindowX, mainWindowY] = myCapacitorApp.getMainWindow().getPosition();
  let [SelectBluetoothDeviceWidth, SelectBluetoothDeviceHeight] = myCapacitorApp.getSelectBluetoothDeviceWindow().getContentSize();
  myCapacitorApp.getSelectBluetoothDeviceWindow().setPosition(
      Math.round(mainWindowX + (mainWindowWidth / 2) - (SelectBluetoothDeviceWidth / 2)),
      Math.round(mainWindowY + (mainWindowHeight / 2) - (SelectBluetoothDeviceHeight / 2)),
    );
  if (electronIsDev) {
    myCapacitorApp.getSelectBluetoothDeviceWindow().webContents.openDevTools();
  }
  myCapacitorApp.getSelectBluetoothDeviceWindow().show();
});

ipcMain.on('scan-stop', (event) => {
  myCapacitorApp.getSelectBluetoothDeviceWindow().hide();
});

