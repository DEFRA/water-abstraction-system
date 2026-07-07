/**
 * Plugin to add Hapi server methods to the global object
 *
 * The advantage of server methods is that their output can be cached. From our tests we have seen that accessing them
 * via `server.methods` and `globalThis.HapiServerMethods` makes use of the same cache. Nevertheless, for consistency we
 * should only access them via `globalThis.HapiServerMethods` even when the server object is available to us.
 *
 * @module GlobalHapiServerMethods
 */

const GlobalHapiServerMethods = {
  name: 'global-hapi-server-methods',
  register: (server, _options) => {
    globalThis.HapiServerMethods = server.methods
  }
}

export default GlobalHapiServerMethods
