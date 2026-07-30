export {};

declare global {
  interface Window {
    electronionicbluetooth: {
      onDeviceScanned(handler: (devices: any[]) => void): void;
      DeviceSelected(id: string): void;
      clearScan(handler: () => void): void;
    };
  }
}