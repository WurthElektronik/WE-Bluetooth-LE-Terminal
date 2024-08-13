# WE Bluetooth LE Terminal

This Project contains the cross plattform project for the WE Bluetooth LE Terminal Application using the Capacitor Framework.
Before using all requirements and dependencies must be resolved using the corresponding instructions below.

Please note: iOS development requires Xcode which is restricted by Apple to be used on compatible Soft- and Hardware only!

The released "WE Bluetooth LE Terminal" Apps can be downloaded from the App stores of Apple and Google.

The Web App is available here : https://wurthelektronik.github.io/WE-Bluetooth-LE-Terminal/

## Requirements

Before starting or using the Project make sure all requirements and dependencies are resolved.
We recommend using Visual Studio Code as IDE/Editor for the Capacitor Project.

- Visual Studio Code 	refer to https://code.visualstudio.com/
- Android 			requires Android Studio & Android SDK, refer to https://developer.android.com/studio
- iOS 				requires Xcode, refer to https://developer.apple.com/xcode/ as well as cocoapods, refer to https://cocoapods.org/
- Node.JS 			refer to https://nodejs.org/en/ for download and install instructions including dependencies
- NPM 				refer to https://docs.npmjs.com/downloading-and-installing-node-js-and-npm for download and install instructions including dependencies

In order to install the required packages/dependencies for the project itself go to the root diretory of the project and run

```
npm install
npm install -g @ionic/cli
```
which will install all dependencies listed in package.json and will also install the ionic cli.

For other ways to install Capacitor Framework by Ionic, refer to https://capacitorjs.com/. Please note that following alternative instructions may not install required dependencies.

| Framework | Version |
| :--------: | :-----: |
| Angular    | 16      |
| Ionic      | 8       |
| Capacitor  | 6       |

| Platform | IDE                        | Target SDK Version | Minimum SDK Version |
| :------: | :------------------------: | :----------------: | :-----------------: |
| Android  | >= Android Studio 2023.1.1 | 34                 | 22 (WebView 89)     |
| iOS      | >= Xcode 15.0              | 15.0               | 13.0                |

### Generating Progressive Web App

Run the following
```
ionic build --prod
```
The built web app is in the directory ./www, in order to run the built web app a web server needs to host the contents of the ./www directory.

The following command can be used to build the web app and host a develepment web server
```
ionic serve --prod
```

### Generating Native Projects for Smartphones

After that run the following for iOS / Xcode project generation
```
ionic cap build ios --prod
```

Or the following for Android Studio project generation
```
ionic cap build android --prod
```

This will build the project for the specified platform and open the native IDE (Android Studio or Xcode).
