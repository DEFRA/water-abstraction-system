'use strict'

/**
 * Plugin to add Hapi server methods to the global object
 * @module GlobalHapiServerMethods
 */

const GlobalHapiServerMethods = {
  name: 'global-hapi-server-methods',
  register: (server, _options) => {
    global.HapiServerMethods = server.methods
  }
}

module.exports = GlobalHapiServerMethods
