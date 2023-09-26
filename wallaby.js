module.exports = function () {
    return {
        files: [
            '*.json',
            'node_modules/**/',
            '*.js',
            'app/**/*.js',
            'lib/**/*.js',
            'app/**/*.js',
            'db/**/*.js',
            'config/**/*.js',

        ],

        tests: [
            'test/**/*.js'
        ],

        setup: function () {
            global.expect = require('sinon').expect;
        },

        env: {
            type: 'node',
            runner: 'node'
        }
    };
};
