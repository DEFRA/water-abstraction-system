'use strict'

/**
 * Plugin to authenticate users
 * @module AuthenticationPlugin
 */

// TODO: use a config file instead
require('dotenv').config()

const TWO_HOURS_IN_MS = 2 * 60 * 60 * 1000

/**
 * Some of our routes serve up pages, and are intended to be called from the UI rather than being hit directly. We do
 * not rely on the UI authenticating requests first as there are some pages which we do not wish to have authentication
 * on (eg. service status pages). We therefore authenticate pages on the System side, relying on an authenticated cookie
 * being passed on by the UI.
 */

const AuthenticationPlugin = {
  name: 'authentication',
  register: async (server, _options) => {
    // TODO: Set @hapi/cookie as a dependency instead
    await server.register(require('@hapi/cookie'))

    server.auth.strategy('session', 'cookie', {
      cookie: {
        name: 'sid',
        password: process.env.COOKIE_SECRET,
        isSecure: false,
        isSameSite: 'Lax',
        ttl: TWO_HOURS_IN_MS,
        isHttpOnly: true
      },
      redirectTo: '/signIn',
      validate: async (_request, session) => {
        const { userId } = session
        // TODO: Look up userId in the IDM to ensure user exists. Also get user role and add to `credentials`
        return { isValid: !!userId, credentials: { userId } }
      }
    })

    server.route({
      method: 'GET',
      path: '/auth-test',
      handler: (request, _h) => {
        return { auth: request.auth }
      },
      options: {
        description: 'Test that authentication is working',
        app: { excludeFromProd: true }
      }
    })

    // TODO: confirm if we want to use this to enable user authentication on ALL routes by default, so we would need to
    // add `auth: false` to the config of each route that doesn't need authentication
    //
    // server.auth.default('session')
  }
}

module.exports = AuthenticationPlugin
