/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('react-native-worklets', () => ({
  scheduleOnRN: jest.fn(
    (callback: (...args: unknown[]) => unknown, ...args: unknown[]) =>
      callback(...args),
  ),
}));

jest.mock('react-native-reanimated', () => ({
  useSharedValue: jest.fn((initialValue: unknown) => ({value: initialValue})),
}));

jest.mock('react-native-vision-camera', () => ({
  useAsyncRunner: jest.fn(() => ({runAsync: jest.fn()})),
  useCameraPermission: jest.fn(() => ({
    hasPermission: false,
    requestPermission: jest.fn(),
    status: 'denied',
  })),
}));

jest.mock('react-native-vision-camera-skia', () => ({
  SkiaCamera: 'SkiaCamera',
}));

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
