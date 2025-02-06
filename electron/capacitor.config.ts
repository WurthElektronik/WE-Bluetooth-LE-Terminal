import { CapacitorElectronConfig } from '@capacitor-community/electron';

const config: CapacitorElectronConfig  = {
  appId: 'com.eisos.proteusconnect',
  appName: 'WE Bluetooth LE Terminal',
  webDir: 'www',
  bundledWebRuntime: false,
  electron:{
    customUrlScheme: "default-src 'self' https://www.we-online.com/ https://github.com/WurthElektronik"
  }
};

export default config;
