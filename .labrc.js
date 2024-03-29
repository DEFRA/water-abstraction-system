'use strict'

module.exports = {
  verbose: true,
  coverage: true,
  // lcov reporter required for SonarCloud
  reporter: ['console', 'html', 'lcov'],
  output: ['stdout', 'coverage/coverage.html', 'coverage/lcov.info'],
  // @aws-sdk/s3 exposes global variables which cause errors during test if we don't ignore them. lab expects the list
  // of globals to ignore to be a single comma-delimited string; for ease of management we define them in an array then
  // join them.
  globals: [
    '__extends', '__assign', '__rest', '__decorate', '__param', '__metadata', '__awaiter', '__generator',
    '__exportStar', '__createBinding', '__values', '__read', '__spread', '__spreadArrays', '__spreadArray', '__await',
    '__asyncGenerator', '__asyncDelegator', '__asyncValues', '__makeTemplateObject', '__importStar', '__importDefault',
    '__classPrivateFieldGet', '__classPrivateFieldSet', '__esDecorate', '__runInitializers', '__propKey',
    '__setFunctionName', '__classPrivateFieldIn', '__addDisposableResource', '__disposeResources',
    // We also ignore globals exposed by global-agent:
    'GLOBAL_AGENT', 'ROARR',
    // GlobalNotifier is added by us a global in a server plugin. It's how we make logging available anywhere in the app
    // whilst avoiding having to pass it around
    'GlobalNotifier',
    // HapiServerMethods is added by us in a server plugin to allow us to access server methods globally.
    'HapiServerMethods'
  ].join(',')
}
