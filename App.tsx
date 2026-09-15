import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useAsyncRunner,
  useCameraPermission,
} from 'react-native-vision-camera';
import { SkiaCamera } from 'react-native-vision-camera-skia';
import { scheduleOnRN } from 'react-native-worklets';

const HEAVY_WORK_ITERATION_COUNT = 10_000_000;

function FpsCounter({ fps }: { fps: number }): React.JSX.Element {
  return (
    <View pointerEvents="none" style={styles.fpsBadge}>
      <Text style={styles.fpsText}>{fps} FPS</Text>
    </View>
  );
}

function App(): React.JSX.Element {
  const { hasPermission, requestPermission, status } = useCameraPermission();
  const asyncRunner = useAsyncRunner();
  const [fps, setFps] = useState(0);
  const [heavyWorkEnabled, setHeavyWorkEnabled] = useState(true);
  const frameCount = useSharedValue(0);
  const sampleStartedAt = useSharedValue(0);
  const iterationCount = useSharedValue(HEAVY_WORK_ITERATION_COUNT);
  const updateFps = useCallback((nextFps: number) => setFps(nextFps), []);
  const toggleHeavyWork = useCallback(() => {
    setHeavyWorkEnabled(currentValue => {
      const nextValue = !currentValue;
      iterationCount.value = nextValue ? HEAVY_WORK_ITERATION_COUNT : 0;
      return nextValue;
    });
  }, [iterationCount]);

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
    <SafeAreaView edges={['top', 'bottom']} style={StyleSheet.absoluteFill}>
      <View style={styles.container}>
        <SkiaCamera
          device="back"
          isActive
          pixelFormat="yuv"
          style={StyleSheet.absoluteFill}
          onFrame={(frame, render) => {
            'worklet';

            const now = Date.now();

            if (sampleStartedAt.value === 0) {
              sampleStartedAt.value = now;
            }

            frameCount.value += 1;
            const elapsed = now - sampleStartedAt.value;

            if (elapsed >= 1000) {
              const measuredFps = Math.round(
                (frameCount.value * 1000) / elapsed,
              );
              frameCount.value = 0;
              sampleStartedAt.value = now;
              scheduleOnRN(updateFps, measuredFps);
            }

            render(({ canvas, frameTexture }) => {
              'worklet';
              canvas.drawImage(frameTexture, 0, 0);
            });

            const wasHandled = asyncRunner.runAsync(() => {
              'worklet';

              const currentIterationCount = iterationCount.value;

              for (let index = 0; index < currentIterationCount; index += 1) {}

              frame.dispose();
            });

            if (!wasHandled) {
              // The runner is busy, so VisionCamera requires this frame to be dropped.
              frame.dispose();
            }
          }}
        />
        <FpsCounter fps={fps} />
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: heavyWorkEnabled }}
          onPress={toggleHeavyWork}
          style={({ pressed }) => [
            styles.heavyWorkButton,
            heavyWorkEnabled
              ? styles.heavyWorkButtonEnabled
              : styles.heavyWorkButtonDisabled,
            pressed && styles.heavyWorkButtonPressed,
          ]}
        >
          <Text style={styles.heavyWorkButtonText}>
            Heavy work: {heavyWorkEnabled ? 'ON' : 'OFF'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
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
  fpsBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  fpsText: {
    color: 'white',
    fontSize: 14,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
  },
  heavyWorkButton: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    left: 24,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 10,
  },
  heavyWorkButtonEnabled: {
    backgroundColor: '#c62828',
  },
  heavyWorkButtonDisabled: {
    backgroundColor: '#2e7d32',
  },
  heavyWorkButtonPressed: {
    opacity: 0.8,
  },
  heavyWorkButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default App;
