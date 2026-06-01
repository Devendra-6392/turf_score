// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ignore backend directory from Metro crawling
config.resolver.blockList = [
  /backend\/.*/
];

module.exports = config;
