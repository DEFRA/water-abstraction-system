// jest.config.js
module.exports = {
    testEnvironment: 'node',
    // The glob patterns Jest uses to detect test files
    testMatch: ['**/tests/**/*.js', '**/?(*.)+(spec|test).js'],// Use 'jsdom' if testing in a browser-like environment
};
