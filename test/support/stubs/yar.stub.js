'use strict'

/**
 * Creates a stubbed instance of the Yar session plugin for testing purposes.
 *
 * Yar is set on the Hapi request object as `request.yar` by the hapi-yar plugin when the server handles a request.
 * Tests that exercise code which calls `request.yar` need to set it up manually as no Hapi server is created in unit
 * tests.
 *
 * @param {object} sinon - The sinon sandbox or instance
 *
 * @returns {object} A stubbed Yar instance with flash, get, set, clear and touch methods
 */
function build(sinon) {
  return {
    flash: sinon.stub(),
    get: sinon.stub(),
    set: sinon.stub(),
    clear: sinon.stub(),
    touch: sinon.stub()
  }
}

module.exports = {
  build
}
