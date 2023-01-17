'use strict'

/**
 * General helper methods
 * @module GeneralLib
 */

/**
 * Returns the current date and time as an ISO string
 *
 * We can't use Date.now() because Javascript returns the time since the epoch in milliseconds, whereas a PostgreSQL
 * timestamp field can only hold the seconds since the epoch. Pass it an ISO string though, for example
 * '2023-01-05T08:37:05.575Z', and PostgreSQL can do the conversion.
 *
 * Thanks to https://stackoverflow.com/a/61912776/6117745
 *
 * @returns {string} The date now as an ISO string, for example `'2023-01-13T18:29:51.682Z'`
 */
function timestampForPostgres () {
  return new Date().toISOString()
}

module.exports = {
  timestampForPostgres
}
