/**
 * Initialises and starts the Hapi server for the internal application
 * @module Server
 */

import BaseServer from 'water-abstraction-engine/base-server'

import AuthService from './services/plugins/auth.service.js'
import ChargingModuleTokenCachePlugin from './plugins/charging-module-token-cache.plugin.js'
import RespTokenCachePlugin from './plugins/resp-token-cache.plugin.js'
import RouterPlugin from './plugins/router.plugin.js'

/**
 * Initialises the Hapi server without starting it
 *
 * Creates the server, registers all plugins, and calls `server.initialize()` which completes the plugin registration
 * process. Returns the initialised server instance without beginning to accept connections.
 *
 * This is primarily used in testing to get a server instance that can handle injected requests without binding to a
 * port.
 *
 * @returns {Promise<object>} The initialised Hapi server instance
 */
export async function init() {
  const viewsConfig = _viewsConfig()

  const server = await BaseServer(viewsConfig, AuthService)

  await _registerPlugins(server)
  await server.initialize()

  return server
}

/**
 * Starts the Hapi server and begins accepting connections
 *
 * Calls `init()` to create and initialise the server, then calls `server.start()` which binds to the
 * configured port and begins listening for requests.
 *
 * @returns {Promise<object>} The running Hapi server instance
 */
export async function start() {
  const server = await init()

  await server.start()

  return server
}

process.on('unhandledRejection', (err) => {
  console.error(err)
  process.exit(1)
})

async function _registerPlugins(server) {
  // NOTE: This order matters to some plugins we register. Inserting into the order should be fine. But if you reorder
  // any existing plugin registration double-check you haven't broken anything!
  await server.register(ChargingModuleTokenCachePlugin)
  await server.register(RespTokenCachePlugin)
  await server.register(RouterPlugin)
}

/**
 * The Hapi vision plugin is registered and managed by water-abstraction-engine to avoid duplication. It also means we
 * can add the govuk frontend and Nunjucks just once to the engine.
 *
 * But the apps need control over the views, so they can be tailored for their different needs. This means the apps need
 * to tell the engine what config Vision should use. This essentially comes down to telling Vision, and Nunjucks where
 * to find stuff. For that to happen we need to dynamically resolve the path to the views directory relative to this at
 * run time.
 *
 * This is why the config is generated and passed through at runtime.
 *
 * @private
 */
function _viewsConfig() {
  return {
    // Only enable caching of templates if we are running in production
    isCached: process.env.NODE_ENV === 'production',
    navigationLinks: [
      { href: '/system/users/me/profile-details', text: 'Profile details' },
      { href: '/account/update-password', text: 'Change password' },
      { href: '/signout', text: 'Sign out' }
    ],
    // the root file path used to resolve and load the templates identified when calling h.view()
    path: 'views',
    // The base path used as prefix for `path:`. It will dynamically resolve to the directory containing this file
    // (…/src/server.js) so that the `path:` is relative to this file.
    relativeTo: import.meta.dirname
  }
}
