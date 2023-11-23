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
 * Checks if any of the periods in checkPeriods overlap with any period in referencePeriods
 * @param {*} referencePeriods Array of objects representing periods with startDate and endDate properties
 * @param {*} checkPeriods Array of objects representing periods to check with startDate and endDate properties
 * @returns Returns true if there is an overlap, otherwise false
 */
function periodsOverlap (referencePeriods, checkPeriods) {
  for (const referencePeriod of referencePeriods) {
    const overLappingPeriods = checkPeriods.filter((checkPeriod) => {
      if (checkPeriod.startDate > referencePeriod.endDate || referencePeriod.startDate > checkPeriod.endDate) {
        return false
      }

      return true
    })

    if (overLappingPeriods.length) {
      return true
    }
  }

  return false
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
  periodsOverlap,
  timestampForPostgres
}
