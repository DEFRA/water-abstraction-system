'use strict'

/**
 * Plugin to authenticate and authorise users
 * @module AuthPlugin
 */

const Boom = require('@hapi/boom')

const AuthService = require('../services/plugins/auth.service.js')

const AuthenticationConfig = require('../../config/authentication.config.js')
const NotifyConfig = require('../../config/notify.config.js')

const TWO_HOURS_IN_MS = 2 * 60 * 60 * 1000

/**
 * Some of our routes serve up pages, and are intended to be called from the UI via its `/system/` proxy path rather
 * than being hit directly. We do not rely on the proxy authenticating requests first as there are some pages which we
 * do not wish to have authentication on (eg. service status pages). We therefore authenticate pages on the System side,
 * relying on an authenticated cookie being passed on by the UI. A request that is not authenticated is automatically
 * redirected to the sign-in page.
 *
 * If the request is authenticated then we pass the user id along to AuthenticationService. This will give us a
 * UserModel object, along with RoleModel and GroupModel objects representing the roles and groups the user is assigned
 * to. These are all added to the request under request.auth.credentials.
 *
 * We also take the role names and add them to an array request.auth.credentials.scope. This scope array is used for
 * authorisation.
 *
 * Routes can have 'scope' added to them via their options.auth.access.scope. This is an array of strings. If a route
 * has a scope array then Hapi will check that request.auth.credentials.scope contains at least one of those strings,
 * and reject the request with a 403 error if it doesn't. In other words, if we add a role name to a route's scope, we
 * can ensure that only users with that role can access the route.
 *
 * More info on authorisation and scope can be found at https://hapi.dev/api/?v=21.3.2#-routeoptionsauthaccessscope
 */

const AuthPlugin = {
  name: 'authentication',
  register: async (server, _options) => {
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
        return AuthService.go(session.userId)
      }
    })

    server.auth.strategy('callback', 'bearer-access-token', {
      allowQueryToken: false, // only accept header by default
      unauthorized: () => {
        return Boom.notFound()
      },
      validate: async (_request, token) => {
        const isValid = token === NotifyConfig.callbackToken

        return {
          isValid,
          credentials: isValid ? { token } : null
        }
      }
    })

    // NOTE: This defaults Hapi to authenticate all routes. If a route, for example `/status`, does not require
    // authentication `options.auth: false` should be set in the route's config.
    server.auth.default('session')
  }
}

module.exports = AuthPlugin
