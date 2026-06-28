import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

// Design base: iPhone 11 (375 x 812)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * Width percentage — returns pixels relative to screen width
 * wp(50) on a 375pt screen = 187.5
 */
export const wp = (percent) => (width * percent) / 100;

/**
 * Height percentage — returns pixels relative to screen height
 * hp(50) on an 812pt screen = 406
 */
export const hp = (percent) => (height * percent) / 100;

/**
 * Linear scale — scales a value linearly based on screen width
 */
export const scale = (size) => (width / BASE_WIDTH) * size;

/**
 * Moderate scale — softer scaling (factor 0 = no scale, 1 = full linear)
 * Good for fonts and paddings so they don't get too extreme
 */
export const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

/**
 * Font scale — rounded moderate scale for font sizes
 */
export const fontScale = (size) =>
  Math.round(PixelRatio.roundToNearestPixel(moderateScale(size, 0.4)));

/**
 * Vertical scale — scales based on screen height
 */
export const verticalScale = (size) => (height / BASE_HEIGHT) * size;

export { width as SCREEN_WIDTH, height as SCREEN_HEIGHT };
