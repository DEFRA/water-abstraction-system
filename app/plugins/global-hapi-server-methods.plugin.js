'use strict'

/**
 * Plugin to add Hapi server methods to the global object
 *
 * The advantage of server methods is that their output can be cached. From our tests we have seen that accessing them
 * via `server.methods` and `global.HapiServerMethods` makes use of the same cache. Nevertheless, for consistency we
 * should only access them via `global.HapiServerMethods` even when the server object is available to us.
 *
 * @module GlobalHapiServerMethods
 */

const GlobalHapiServerMethods = {
  name: 'global-hapi-server-methods',
  register: (server, _options) => {
    global.HapiServerMethods = server.methods
  }
}

module.exports = GlobalHapiServerMethods
