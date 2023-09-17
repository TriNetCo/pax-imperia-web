// don't forget module name mapper configs
const config = {
//   rootDir: './../',
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/tools/fileMock.js',
    '\\.(css|less)$': '<rootDir>/tools/styleMock.js'
  },
//   testEnvironment: '<rootDir>/node_modules/jest-environment-jsdom',
  testEnvironment: 'jsdom',
//   transform: {},
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  displayName: 'react-frontend',
  moduleDirectories: ['<rootDir>/node_modules', '<rootDir>'],
  modulePaths: ['<rootDir>/node_modules', '<rootDir>'],
//   modulePaths: ['<rootDir>/node_modules', '<rootDir>', '<rootDir>/../pax-imperia-js/node_modules'],
  testMatch: ['<rootDir>/**/*.test.js']
};

module.exports = config;
