/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('react-native-worklets', () =>
  require('react-native-worklets/src/mock'),
);

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
