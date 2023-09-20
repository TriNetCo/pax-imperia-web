// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import { cleanup } from '@testing-library/react';

// we need a mock of document
// we need to use the import syntax here
// because jest hoists the imports
// and we need to set the document before
// the import of the other modules

// import { JSDOM } from 'jsdom';
// const { document } = (new JSDOM('')).window;
// global.document = document;
// global.window = document.defaultView;
// global.navigator = {
//     userAgent: 'node.js',
// };

// we need to mock out the cache api
// because it is not available in the jsdom environment
// const cache = {
//     put: jest.fn(),
//     match: jest.fn(),
//     registered: [],
// };

// global.caches = {
//     open: jest.fn().mockResolvedValue(cache),
//     default: cache,
// };


// to fix a bug where it says Cannot read properties of null (reading 'registered')
// we need to

require('jest-fetch-mock').enableMocks();

global.console = {
    ...console,
    // uncomment to ignore a specific log level
    // log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    // error: jest.fn(),
};

class LocalStorageMock {
    constructor() {
        this.store = {};
    }

    clear() {
        this.store = {};
    }

    getItem(key) {
        return this.store[key] || null;
    }

    setItem(key, value) {
        this.store[key] = String(value);
    }

    removeItem(key) {
        delete this.store[key];
    }
}

global.localStorage = new LocalStorageMock;

afterEach(cleanup);
