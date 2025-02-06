require('./rt/electron-rt');
//////////////////////////////
// User Defined Preload scripts below
console.log('User Preload!');
import { ipcRenderer,contextBridge } from 'electron';
contextBridge.exposeInMainWorld('capacitorionicbluetooth', {
    startScan: () => ipcRenderer.send('scan-start'),
    stopScan: () => ipcRenderer.send('scan-stop'),
    scanCancelled: (handler) => ipcRenderer.on('scan-cancelled', (event, ...args) => handler(...args))
});
