import { ipcRenderer,contextBridge } from 'electron';
console.log('User Preload!');
contextBridge.exposeInMainWorld('electronionicbluetooth', {
    onDeviceScanned: (handler) => ipcRenderer.on('device-scanned', (event, ...args) => handler(...args)),
    DeviceSelected: (id) => ipcRenderer.send('device-selected',id),
    clearScan: (handler) => ipcRenderer.on('clear-scan', (event, ...args) => handler(...args)),
})
  