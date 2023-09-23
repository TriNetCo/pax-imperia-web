const config = {
    moduleNameMapper: {
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/tools/fileMock.js',
        '\\.(css|less)$': '<rootDir>/tools/styleMock.js'
    },
    testEnvironment: '<rootDir>/node_modules/jest-environment-jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
    modulePaths: ['<rootDir>/node_modules', '<rootDir>'],
};

module.exports = config;
