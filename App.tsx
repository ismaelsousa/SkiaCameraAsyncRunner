import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  useAsyncRunner,
  useCameraPermission,
} from 'react-native-vision-camera';
import { SkiaCamera } from 'react-native-vision-camera-skia';

const ITERATION_COUNT = 10_000_000;

function App(): React.JSX.Element {
  const { hasPermission, requestPermission, status } = useCameraPermission();
  const asyncRunner = useAsyncRunner();

  useEffect(() => {
    if (status === 'not-determined') {
      requestPermission();
    }
  }, [requestPermission, status]);

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          {status === 'denied' || status === 'restricted'
            ? 'Camera permission is required. Enable it in system settings.'
            : 'Requesting camera permission…'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SkiaCamera
        device="back"
        isActive
        pixelFormat="yuv"
        style={StyleSheet.absoluteFill}
        onFrame={(frame, render) => {
          'worklet';

          render(({ canvas, frameTexture }) => {
            'worklet';
            canvas.drawImage(frameTexture, 0, 0);
          });

          const wasHandled = asyncRunner.runAsync(() => {
            'worklet';

            for (let index = 0; index < ITERATION_COUNT; index += 1) {}

            frame.dispose();
          });

          if (!wasHandled) {
            // The runner is busy, so VisionCamera requires this frame to be dropped.
            frame.dispose();
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    paddingHorizontal: 32,
  },
  permissionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default App;
