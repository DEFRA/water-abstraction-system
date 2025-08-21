'use strict'

/**
 * Adds a server method which returns a signed JWT access token for GOV.UK Notify.
 *
 * We use hapi's built-in caching to return a token if one exists, or retrieve a new one if it doesn't
 *
 * @module NotifyTokenCachePlugin
 */

const jwt = require('jsonwebtoken')

const notifyConfig = require('../../config/notify.config.js')

const FIVE_SECS_IN_MS = 5 * 1000
const TWENTY_FIVE_SECS_IN_MS = 25 * 1000

const NotifyTokenCachePlugin = {
  name: 'NotifyTokenCache',
  register: (server, _options) => {
    // The following description comes from https://hapi.dev/tutorials/servermethods
    //
    // > Server methods are a useful way of sharing functions by attaching them to your server object rather than
    // > requiring a common module everywhere it is needed. Server methods are also used heavily for caching purposes.
    // >
    // > [..]
    // >
    // > The first way to call server.method() is with the signature `server.method(name, method, [options])`.
    //
    // This plugin is adding a server method called `getNotifyToken()` which we can then access from anywhere in our
    // app using `await global.HapiServerMethods.getNotifyToken()`.
    //
    // The function we're adding will generate a signed JWT token using the GOV.UK Notify API key provided in our
    // config.
    //
    // The third argument is the options for the method. By defining `cache:` we are telling Hapi to cache the return
    // value and serve it from cache instead of re-running the function every time it is called. When sending
    // notifications, for example return invitations, we may be required to send hundreds of them at a time. Using a
    // Hapi server method means we can avoid generating and signing a new JSON web token for each and every request.
    server.method(
      'getNotifyToken',
      async () => {
        const { secret, serviceId } = _credentials()

        return jwt.sign(
          {
            iss: serviceId,
            // iat (issued at) is the current time in UTC in epoch seconds. Notify will consider the token expired 30
            // secs after this
            iat: Math.round(Date.now() / 1000)
          },
          secret,
          {
            header: { typ: 'JWT', alg: 'HS256' }
          }
        )
      },
      {
        cache: {
          // We know Notify considers a token expired 30 seconds after creation. So, we tell Hapi to cache the token
          // for 25 seconds to avoid the risk of a notification failing due to Hapi considering it expired
          expiresIn: TWENTY_FIVE_SECS_IN_MS,
          // Hapi requires us to set a timeout value here so we set it to error after 5 seconds
          generateTimeout: FIVE_SECS_IN_MS
        }
      }
    )
  }
}

/**
 * Notify expects the JSON web token to be encoded using a secret key. This is extracted from the API key they provide
 * in the service's dashboard.
 *
 * For example, if your API key is
 * `my_test_key-26785a09-ab16-4eb0-8407-a37497a57506-3d844edf-8d35-48ac-975b-e847b4f122b0`:
 *
 * - your API key name is `my_test_key`
 * - your iss (your service id) is 26785a09-ab16-4eb0-8407-a37497a57506
 * - your secret key is 3d844edf-8d35-48ac-975b-e847b4f122b0
 *
 * This method extracts the iss and secret key from the API key in order to sign the JSON web token as required.
 *
 * @private
 */
function _credentials() {
  const { apiKey } = notifyConfig

  return {
    secret: apiKey.substring(apiKey.length - 36, apiKey.length),
    serviceId: apiKey.substring(apiKey.length - 73, apiKey.length - 37)
  }
}

module.exports = NotifyTokenCachePlugin
