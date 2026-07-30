import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
type Handler<T extends any[] = any[]> = (...args: T) => void;
contextBridge.exposeInMainWorld('electronionicbluetooth', {
    onDeviceScanned: (handler: Handler) => ipcRenderer.on('device-scanned', (event, ...args) => handler(...args)),
    DeviceSelected: (id: string) => ipcRenderer.send('device-selected',id),
    clearScan: (handler: Handler) => ipcRenderer.on('clear-scan', (event, ...args) => handler(...args)),
});
  