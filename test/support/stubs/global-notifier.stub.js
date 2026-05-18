'use strict'

/**
 * Creates a stubbed instance of GlobalNotifier for testing purposes.
 *
 * GlobalNotifier is set on globalThis in app/plugins/global-notifier.plugin.js when the Hapi server starts. Tests that
 * exercise code which calls GlobalNotifier need to set it up manually as no Hapi server is created in unit tests.
 *
 * @param {object} sinon - The sinon sandbox or instance
 *
 * @returns {object} A stubbed GlobalNotifier with omg, omfg and redAlert methods
 */
function build(sinon) {
  return {
    omg: sinon.stub(),
    omfg: sinon.stub(),
    redAlert: sinon.stub()
  }
}

module.exports = {
  build
}
