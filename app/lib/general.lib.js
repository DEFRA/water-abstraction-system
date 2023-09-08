'use strict'

/**
 * General helper methods
 * @module GeneralLib
 */

const { randomUUID } = require('crypto')

/**
 * Generate a Universally Unique Identifier (UUID)
 *
 * The service uses these as the IDs for most records in the DB. Most tables will automatically generate them when
 * the record is created but not all do. There are also times when it is either more performant, simpler, or both for
 * us to generate the ID before inserting a new record. For example, we can pass the generated ID to child records to
 * set the foreign key relationship.
 *
 * NOTE: We set `disableEntropyCache` to `false` as normally, for performance reasons node caches enough random data to
 * generate up to 128 UUIDs. We disable this as we may need to generate more than this and the performance hit in
 * disabling this cache is a rounding error in comparison to the rest of the process.
 *
 * https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
 *
 * @returns {String} a randomly generated UUID
 */
function generateUUID () {
  return randomUUID({ disableEntropyCache: true })
}

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
  generateUUID,
  timestampForPostgres
}
