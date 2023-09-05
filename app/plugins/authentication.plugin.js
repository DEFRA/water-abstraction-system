'use strict'

/**
 * Plugin to authenticate users
 * @module AuthenticationPlugin
 */

const AuthenticationConfig = require('../../config/authentication.config.js')

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
    // We wait for @hapi/cookie to be registered before setting up the authentication strategy
    server.dependency('@hapi/cookie', async (server) => {
      server.auth.strategy('session', 'cookie', {
        cookie: {
          name: 'sid',
          password: AuthenticationConfig.password,
          isSecure: false,
          isSameSite: 'Lax',
          ttl: TWO_HOURS_IN_MS,
          isHttpOnly: true
        },
        redirectTo: '/signin',
        validate: async (_request, session) => {
          const { userId } = session
          // TODO: Look up userId in the IDM to ensure user exists. Also get user role and add to `credentials`
          return { isValid: !!userId, credentials: { userId } }
        }
      })

      // We set up our route in the dependency callback as we can't set authentication before the strategy is registered
      server.route({
        method: 'GET',
        path: '/auth-test',
        handler: (request, _h) => {
          return { auth: request.auth }
        },
        options: {
          description: 'Test that authentication is working',
          app: { excludeFromProd: true },
          auth: {
            strategy: 'session'
          }
        }
      })

      // We don't use an option path param (ie. `{role?}`) as this doesn't work with dynamic scope; not entering a role
      // would mean that the scope is empty and therefore nobody can access it
      server.route({
        method: 'GET',
        path: '/auth-test/{role}',
        handler: (request, _h) => {
          return { auth: request.auth }
        },
        options: {
          description: 'Test that authentication is working',
          app: { excludeFromProd: true },
          auth: {
            strategy: 'session',
            access: {
              scope: ['{params.role}']
            }
          }
        }
      })
    })
  }
}

module.exports = AuthenticationPlugin
