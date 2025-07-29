import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eisos.proteusconnect',
  appName: 'WE Bluetooth LE Terminal',
  webDir: 'www',
  server:
  {
    errorPath: 'assets/error_pages/webview_version.html'
  },
  android:
  {
    minWebViewVersion: 89,
    // adjustMarginsForEdgeToEdge: 'auto'
  },
  plugins : {
    Keyboard: {
      resizeOnFullScreen: false
    },
    EdgeToEdge: {
      backgroundColor: "#e3000b"
    }
  }
};

export default config;
