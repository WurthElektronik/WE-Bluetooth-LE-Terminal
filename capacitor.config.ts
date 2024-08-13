import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eisos.proteusconnect',
  appName: 'WE Bluetooth LE Terminal',
  webDir: 'www',
  bundledWebRuntime: false,
  server:
  {
    errorPath: 'assets/error_pages/webview_version.html'
  },
  android:
  {
    minWebViewVersion: 89
  }
};

export default config;
