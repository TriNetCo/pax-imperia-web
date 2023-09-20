const isVsCode = process.env.ELECTRON_NO_ASAR === '1';

module.exports = {
    env: {
        browser: true,
        es2020: true
    },
    extends: [
        'plugin:react/recommended',
    ],
    overrides: [
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    plugins: [
        'react',
    ],
    rules: {
        indent: [
            'error',
            4,
            { SwitchCase: 1 }
        ],
        quotes: [
            'error',
            'single'
        ],
        semi: [
            'error',
            'always'
        ],
        curly: 'off',
        'padded-blocks': 'off',
        'array-bracket-spacing': 'off',
        'key-spacing': 'off',
        'no-multi-spaces': 'off',
        'react/react-in-jsx-scope': 'off',
        'no-multiple-empty-lines': isVsCode ? 'off' : 'error',
        'no-debugger': isVsCode ? 'off' : 'error',
    },
    settings: {
        react: {
            version: 'detect'
        }
    }
};
