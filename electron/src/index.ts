import {
	app,
	BrowserWindow,
	ipcMain,
	shell,
	nativeImage,
	protocol,
	net,
} from 'electron';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';

const electronIsDev = !app.isPackaged;

const MainWindowURL: string = 'app://localhost/';

var SelectBluetoothDeviceWindow: BrowserWindow;
var MainWindow: BrowserWindow;
var BluetoothDeviceSelectCallback: ((deviceId: string) => void) | null = null;

const createWindow = () => {
	const icon = nativeImage.createFromPath(
		path.join(
			app.getAppPath(),
			'assets',
			process.platform === 'win32' ? 'appIcon.ico' : 'appIcon.png',
		),
	);
	// Create the browser window.
	MainWindow = new BrowserWindow({
		show: false,
		width: 1000,
		height: 800,
		icon: icon,
		webPreferences: {
			preload: path.join(app.getAppPath(), 'build', 'preload.js'),
		},
	});

	SelectBluetoothDeviceWindow = new BrowserWindow({
		parent: MainWindow,
		show: false,
		modal: true,
		maximizable: false,
		maxHeight: 400,
		maxWidth: 800,
		height: 400,
		width: 800,
		movable: false,
		resizable: false,
		minimizable: false,
		icon: icon,
		webPreferences: {
			nodeIntegration: true,
			preload: path.join(
				app.getAppPath(),
				'build',
				'SelectBluetoothDevice',
				'SelectBluetoothDevicePreload.js',
			),
		},
	});

	MainWindow.loadURL(MainWindowURL);

	SelectBluetoothDeviceWindow.loadFile(
		path.join(app.getAppPath(), 'assets', 'SelectBluetoothDevice.html'),
	);
};

app.commandLine.appendSwitch('enable-experimental-web-platform-features');
app.commandLine.appendSwitch('enable-web-bluetooth');

protocol.registerSchemesAsPrivileged([
	{
		scheme: 'app',
		privileges: {
			standard: true,
			secure: true,
			supportFetchAPI: true,
			corsEnabled: true,
			stream: true,
		},
	},
]);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	protocol.handle('app', async (request) => {
		const url = new URL(request.url);
		let filePath = url.pathname;

		if (filePath.startsWith('/')) {
			filePath = filePath.slice(1);
		}

		if (!filePath) {
			filePath = 'index.html';
		}

		const fullPath = path.join(app.getAppPath(), 'app', filePath);
		const exists = existsSync(fullPath);

		const servePath = exists
			? fullPath
			: path.join(app.getAppPath(), 'app', 'index.html');

		return net.fetch(pathToFileURL(servePath).toString());
	});

	createWindow();

	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});

	if (!electronIsDev) {
		MainWindow.setMenu(null);
	}

	MainWindow.webContents.on(
		'select-bluetooth-device',
		(
			event: Event,
			deviceList: BluetoothDevice[],
			callback: (deviceId: string) => void,
		) => {
			event.preventDefault();
			SelectBluetoothDeviceWindow.webContents.send(
				'device-scanned',
				deviceList,
			);
			BluetoothDeviceSelectCallback = callback;
		},
	);

	MainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url);
		return { action: 'deny' };
	});

	MainWindow.webContents.on('will-navigate', (event, url) => {
		if (url.startsWith(MainWindowURL)) {
			return;
		}
		event.preventDefault();
		shell.openExternal(url);
	});

	SelectBluetoothDeviceWindow.on('close', (event) => {
		event.preventDefault();
		SelectBluetoothDeviceWindow.hide();
		if (BluetoothDeviceSelectCallback) {
			BluetoothDeviceSelectCallback('');
		}
		BluetoothDeviceSelectCallback = null;
		MainWindow.webContents.send('scan-cancelled');
	});

	MainWindow.once('ready-to-show', () => {
		MainWindow.show();
		MainWindow.focus();

		if (electronIsDev) {
			MainWindow.webContents.openDevTools();
		}
	});
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
ipcMain.on('device-selected', (event, id: string) => {
	SelectBluetoothDeviceWindow.hide();
	BluetoothDeviceSelectCallback?.(id);
	BluetoothDeviceSelectCallback = null;
});

ipcMain.on('scan-start', (event) => {
	SelectBluetoothDeviceWindow.webContents.send('clear-scan');
	let [mainWindowWidth, mainWindowHeight] = MainWindow.getContentSize();
	let [mainWindowX, mainWindowY] = MainWindow.getPosition();
	let [SelectBluetoothDeviceWidth, SelectBluetoothDeviceHeight] =
		SelectBluetoothDeviceWindow.getContentSize();
	SelectBluetoothDeviceWindow.setPosition(
		Math.round(
			mainWindowX + mainWindowWidth / 2 - SelectBluetoothDeviceWidth / 2,
		),
		Math.round(
			mainWindowY + mainWindowHeight / 2 - SelectBluetoothDeviceHeight / 2,
		),
	);
	if (electronIsDev) {
		SelectBluetoothDeviceWindow.webContents.openDevTools();
	}
	SelectBluetoothDeviceWindow.show();
});

ipcMain.on('scan-stop', (event) => {
	SelectBluetoothDeviceWindow.hide();
});
