'use strict'

/**
 * Plugin to authenticate users
 * @module AuthenticationPlugin
 */

const AuthenticationConfig = require('../../config/authentication.config.js')

const FetchUserRolesAndGroupsService = require('../services/idm/fetch-user-roles-and-groups.service.js')

const TWO_HOURS_IN_MS = 2 * 60 * 60 * 1000

/**
 * Some of our routes serve up pages, and are intended to be called from the UI via its `/system/` proxy path rather
 * than being hit directly. We do not rely on the proxy authenticating requests first as there are some pages which we
 * do not wish to have authentication on (eg. service status pages). We therefore authenticate pages on the System side,
 * relying on an authenticated cookie being passed on by the UI. A request that is not authenticated is automatically
 * redirected to the sign-in page.
 *
 * If the request is authenticated then we look up the user in the IDM using FetchUserRolesAndGroupsService. This gives
 * us a UserModel object, along with RoleModel and GroupModel objects representing the roles and groups the user is
 * assigned to. These are all added to the request under request.auth.credentials. We add the user to the credentials
 * as controllers and services may need user info such as the email address. The roles and groups are "nice to have" at
 * this stage.
 *
 * We also take the role names and add them to an array request.auth.credentials.scope. This scope array is used for
 * authorisation.
 *
 * Routes can have 'scope' added to them via their options.auth.strategy.scope. This is an array of strings. If a route
 * has a scope array then Hapi will check that request.auth.credentials.scope contains at least one of those strings,
 * and reject the request with a 403 error if it doesn't. In other words, if we add a role name to a route's scope, we
 * can ensure that only users with that role can access the route.
 *
 * More info on authorisation and scope can be found at https://hapi.dev/api/?v=21.3.2#-routeoptionsauthaccessscope
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

          const { user, roles, groups } = await FetchUserRolesAndGroupsService.go(userId)

          // We put each role's name into the scope array for hapi to use for its scope authorisation
          const scope = roles.map((role) => {
            return role.role
          })

          return { isValid: !!user, credentials: { user, roles, groups, scope } }
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
