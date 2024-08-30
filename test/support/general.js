'use strict'

/**
 * General helper functions available to all helpers
 * @module GeneralHelper
 */

/**
 * Generate the POST request options needed for `server.inject()`
 *
 * When testing controllers we simulate a request to the app using
 * {@link https://hapi.dev/api#-await-serverinjectoptions | server.inject()}.
 *
 * > Injection is useful for testing purposes as well as for invoking routing logic internally without the overhead and
 * > limitations of the network stack.
 *
 * The only required parameter is the `path`. Because the majority of our POST endpoints require the user to be
 * authenticated, and have CSRF protection we provide default values that will enable these features in the request
 * options. If you need to mimic a request where, for example, authentication is not required override the default with
 * `null`.
 *
 * Most of our endpoints require some form of authentication. Using this helper removes the overhead of assigning the
 * necessary `auth:` options to make it work in our unit tests.
 *
 * We also use {@link https://hapi.dev/module/crumb/ | Hapi crumb} to provide CSRF crumb generation and validation on
 * most of our POST endpoints (anything involving submitting a form). Normally, the 'crumb' would be generated during
 * the GET request, added to the form as a hidden value, and validated during the POST with what was saved in the
 * cookie.
 *
 * We can mimic the same process without making the GET request by adding both a header and a value to the payload for
 * the 'crumb' in the POST request.
 *
 * @param {string} path - the full path for the request
 * @param {object} [payload={}] - the payload to be sent in the request. Set to null if no payload should be sent
 * @param {string[]} [scope=[billing]] - the auth scope to apply to the request. Set to null if no auth should be
 * applied
 * @param {string} [crumb=WYuCN5hiKnNkLpmUrEQj6Xer49FqfBPv20VO1C5wQHk] - the CSRF 'crumb' value to be used to verify the
 * request. Set to null if no crumb should be applied
 *
 * @returns {object} the options to be used in the call to `server.inject()`
 */
function postRequestOptions (
  path,
  payload = {},
  scope = ['billing'],
  crumb = 'WYuCN5hiKnNkLpmUrEQj6Xer49FqfBPv20VO1C5wQHk'
) {
  const options = {
    method: 'POST',
    url: path,
    payload: { ...payload }
  }

  if (scope) {
    options.auth = { strategy: 'session', credentials: { scope } }
  }

  if (crumb) {
    options.headers = { cookie: `wrlsCrumb=${crumb}` }
    options.payload.wrlsCrumb = crumb
  }

  return options
}

/**
 * Generate a random integer within a range (inclusive)
 *
 * @param {number} min - lowest number (integer) in the range (inclusive)
 * @param {number} max - largest number (integer) in the range (inclusive)
 *
 * Credit https://stackoverflow.com/a/7228322
 *
 * @returns a number between min and max (inclusive)
 */
function randomInteger (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

/**
 * Select a random entry from an array of entries
 *
 * Was built when we started using real reference data within the unit tests, for example, regions and purposes.
 *
 * Where we want to select a real value but don't care which, this can be used by the helper so select a random entry
 * from the reference data.
 *
 * @param {object[]} data - an array of values to randomly select from
 *
 * @returns a random entry from the data provided
 */
function selectRandomEntry (data) {
  const randomIndex = randomInteger(0, data.length - 1)

  return data[randomIndex]
}

/**
 * Generates a random region code
 *
 * Region codes should be between 1 and 9 based on the fixed region reference data.
 *
 * We see issues with this small range when tables have unique constraints when building external id's.
 *
 * This function is here to encapsulate this issue and remove any need to explain the issue else where in the tests.
 *
 * @returns a random number
 */
function randomRegionCode () {
  return randomInteger(1, 999999)
}

module.exports = {
  postRequestOptions,
  randomInteger,
  randomRegionCode,
  selectRandomEntry
}
