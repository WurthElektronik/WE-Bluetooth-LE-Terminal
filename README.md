# Proteus Connect

This Project contains the cross plattform project for the Proteus Connect Application using the Capacitor Framework.
Before using all requirements and dependencies must be resolved using the corresponding instructions below.

Please note: iOS development requires XCode which is restricted by Apple to be used on compatible Soft- and Hardware only!

Corresponding Feather M0 firmware can be found in the Sensor2BLE project inside the https://github.com/WurthElektronik/FeatherWings repository.

The released "Proteus Connect" Apps can be downloaded from the App stores of Apple and Google.

## Requirements

Before starting or using the Project make sure all requirements and dependencies are resolved.
We recommend using Visual Studio Code as IDE/Editor for the Capacitor Project.

- Visual Studio Code 	refer to https://code.visualstudio.com/
- Android 			requires Android Studio & Android SDK, refer to https://developer.android.com/studio
- iOS 				requires XCode, refer to https://developer.apple.com/xcode/
- Node.JS 			refer to https://nodejs.org/en/ for download and install instructions including dependencies
- NPM 				refer to https://docs.npmjs.com/downloading-and-installing-node-js-and-npm for download and install instructions including dependencies



In order to install the required packages/dependencies for the project itself go to the root diretory of the project and run

```
npm install
npm install -g @ionic/cli
```
which will install all dependencies listed in package.json and also install the ionic cli

For other ways to install Capacitor Framework by Ionic, refer to https://capacitorjs.com/. Please note that following alternative instructions may not install required dependencies.


### Generating native Projects

After that run the following for iOS / XCode project generation
```
ionic cap build ios --prod
```

Or the following for Android Studio project generation
```
ionic cap build android --prod
```

This will build the project for the specified platform and open the native IDE (Android Studio or XCode).


### Known issues
- iOS: 
As Apple changes their connection timing from time to time and possibly with each OS revision we cannot ensure a proper latency vs. stability setting for all iOS devices and all iOS versions in the future.
