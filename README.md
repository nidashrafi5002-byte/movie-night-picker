# Movie Night Picker (Fire TV)

A group movie-night picker for Fire TV. Everyone in the room sets their age
group and mood with the remote, picks how much time they have, and the app
suggests 3 films that fit the whole group, with a one-line reason for each.

Built for the Build, Ship, Shape: Amazon Developer Hackathon (Fire TV track,
Fire OS).

## Features
- Remote-friendly UI: arrow keys to move, Select to choose, Back to go back
- Works for up to 6 people at once
- Never suggests a film above the youngest viewer's age
- Runs fully offline, with no server, no accounts and no API keys
- Catalog of public-domain films stored locally in a JSON file

## How it works
- `app/src/logic/scoring.js` filters films by runtime and the youngest age,
  then ranks them by how many people's moods match.
- `app/src/logic/dpad.js` implements D-pad focus navigation.
- `android/` wraps the built web app in an Android TV WebView app for Fire OS.

## Run the web version
    cd app
    npm install
    npm run dev

## Run on a Fire TV / Android TV emulator
1. Install Android Studio and create a Television (1080p) emulator in Device Manager.
2. Build the web app:
       cd app
       npm install
       npm run build
3. Copy the contents of `app/dist` into `android/app/src/main/assets`.
4. Open the `android` folder in Android Studio, let Gradle sync, choose the
   Television emulator, and click Run.

## Tech
React, Vite, Kotlin, Android WebView with WebViewAssetLoader, Android Studio.

## Notes
- `androidx.core:core-ktx` is pinned to 1.15.0 because newer versions need a
  newer Android Gradle Plugin than the default project template.
- Films are public-domain titles. Verify availability before relying on them.

## License
MIT