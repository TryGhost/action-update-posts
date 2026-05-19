module.exports = {
    plugins: ['ghost'],
    extends: [
        'plugin:ghost/node'
    ],
    overrides: [{
        files: ['*.mjs'],
        parserOptions: {
            sourceType: 'module'
        }
    }]
};
