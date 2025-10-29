'use strict'

/**
 * General helper functions available to all helpers
 * @module GeneralHelper
 */

const { generateRandomInteger, today } = require('../../app/lib/general.lib.js')

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
function postRequestOptions(
  path,
  payload = {},
  scope = ['billing', 'returns'],
  crumb = 'WYuCN5hiKnNkLpmUrEQj6Xer49FqfBPv20VO1C5wQHk'
) {
  const options = {
    method: 'POST',
    url: path,
    payload: { ...payload }
  }

  if (scope) {
    options.auth = {
      strategy: 'session',
      credentials: {
        scope,
        user: {
          id: 1000
        }
      }
    }
  }

  if (crumb) {
    options.headers = { cookie: `wrlsCrumb=${crumb}` }
    options.payload.wrlsCrumb = crumb
  }

  return options
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
function randomRegionCode() {
  return generateRandomInteger(1, 999999)
}

/**
 * Returns a date relative to today by the specified number of days.
 *
 * If the number of days is positive, it will add that number of days to today. If it is negative, it will subtract that
 * number of days from today.
 *
 * @param {number} numberOfDays - the number of days to add to, or subtract from, today
 *
 * @returns {Date} a date relative to today
 */
function relativeToToday(numberOfDays) {
  const relative = today()

  // We lean into Math to make this work. Adding two positive numbers, results in a positive value, for example,
  // 12 + +5 = 12 + 5 = 17.
  //
  // However, when you add a negative number to a positive, it will be treated as subtraction, for example,
  // 12 + -5 = 12 - 5 = 7.
  relative.setDate(relative.getDate() + numberOfDays)

  return relative
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
function selectRandomEntry(data) {
  const randomIndex = generateRandomInteger(0, data.length - 1)

  return data[randomIndex]
}

/**
 * Returns a date object representing tomorrow's date
 *
 * @returns {Date} tomorrow's date
 */
function tomorrow() {
  const tomorrow = today()

  tomorrow.setDate(tomorrow.getDate() + 1)

  return tomorrow
}

/**
 * Returns a date object representing yesterday's date
 *
 * @returns {Date} yesterday's date
 */
function yesterday() {
  const yesterday = today()

  yesterday.setDate(yesterday.getDate() - 1)

  return yesterday
}

module.exports = {
  postRequestOptions,
  randomRegionCode,
  relativeToToday,
  selectRandomEntry,
  tomorrow,
  yesterday
}
