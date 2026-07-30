// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

type Handler<T extends any[] = any[]> = (...args: T) => void;

contextBridge.exposeInMainWorld('capacitorionicbluetooth', {
    startScan: () => ipcRenderer.send('scan-start'),
    stopScan: () => ipcRenderer.send('scan-stop'),
    scanCancelled: (handler: Handler) => ipcRenderer.on('scan-cancelled', (event, ...args) => handler(...args))
});
