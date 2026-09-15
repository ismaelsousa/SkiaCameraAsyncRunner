



# SkiaCameraAsyncRunner

A React Native Community CLI app that renders a full-screen VisionCamera feed
through Skia while running a 5,000,000-iteration workload on VisionCamera's
dedicated async runner.

## Frame lifecycle

Every camera frame is rendered immediately. The frame is then submitted to the
async runner:

- If accepted, the loop runs off the camera thread and the frame is disposed in
  a `finally` block when the work finishes.
- If the runner is busy, the frame is dropped and disposed immediately, as
  required by VisionCamera.

## Native setup

Camera permission declarations are already included for Android and iOS, and
the Worklets Babel plugin is configured.

Before the first iOS run, install pods:

```sh
bundle install
bundle exec pod install
```

Start Metro with a clean cache after the Worklets configuration change:

```sh
npm start -- --reset-cache
```

Then build from another terminal:

```sh
npm run android
# or
npm run ios
```


# Example

https://github.com/user-attachments/assets/0db1f89d-5f75-4735-a1d8-9c116207a0c7
