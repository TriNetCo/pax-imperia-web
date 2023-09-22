const config = {
    rootDir: './../',
    testEnvironment: 'jest-environment-node',
    transform: {},
    displayName: 'pax-imperia-js',
    moduleDirectories: ['node_modules', '<rootDir>/pax-imperia-js'],
    modulePaths: ['node_modules', '<rootDir>/pax-imperia-js'],
    testMatch: ['<rootDir>/pax-imperia-js/**/*.test.js']
};

module.exports = config;
