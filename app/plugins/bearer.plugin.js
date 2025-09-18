'use strict'

/**
 * Plugin to add bearer token support
 * @module BearerPlugin
 */

const Bearer = require('hapi-auth-bearer-token')

/**
 * {@link https://github.com/johnbrett/hapi-auth-bearer-token | hapi auth bearer token} is a plugin that adds the ability
 * to use the `bearer-access-token` authentication strategy. It is used to authenticate requests to the service that have
 * a matching token and is receommended by {@link https://hapi.dev/plugins/#authentication | HAPI}
 *
 * The AuthPlugin manages the authentication strategies and is where the logic sits for validating the token in requests.
 * Like our other authentication strategies you envoke it by setting it on the route:
 *
 * ```javascript
 *   ...
 *   options: {
 *     auth: { strategy: 'callback' }
 *   }
 *   ...
 * ```
 *
 * At the moment we're only using this strategy for one end point.
 *
 * We have a route, '/notifications/callbacks/letters', that will be used by GovNotify to let us know when a letter
 * has been returned to their printer. This can happen when someone marks the letter as 'not known at this address'
 * or if Royal Mail are unable to deliver the letter to the address as it is invalid.
 *
 * GovNotify has a screen for managing the callback URL and token. We manage the token on our side like our normal
 * environment variables.
 *
 */
const BearerPlugin = {
  plugin: Bearer
}

module.exports = BearerPlugin
