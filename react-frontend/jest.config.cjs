// don't forget module name mapper configs
const config = {
  rootDir: './../',
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/react-frontend/tools/fileMock.js',
    '\\.(css|less)$': '<rootDir>/react-frontend/tools/styleMock.js'
  },
//   testEnvironment: '<rootDir>/react-frontend/node_modules/jest-environment-jsdom',
//   testEnvironment: 'jsdom',
//   transform: {},
  setupFilesAfterEnv: ['<rootDir>/react-frontend/src/setupTests.js'],
  displayName: 'react-frontend',
  moduleDirectories: ['node_modules', '<rootDir>/react-frontend'],
  modulePaths: ['node_modules', '<rootDir>/react-frontend'],
  testMatch: ['<rootDir>/react-frontend/**/*.test.js']
};

module.exports = config;
