'use strict'

/**
 * General helper methods
 * @module GeneralLib
 */

const { randomUUID } = require('crypto')

/**
 * Returns the current time in nanoseconds. Used as part of logging how long something takes
 *
 * We often want to see how long a process takes and capture it in our logs. This can be especially useful when we
 * have a process that involves talking to an external one. By capturing the time it takes our process to complete
 * we can deal with any challenges about the performance of our process VS the total time taken.
 *
 * To do that you need to record the time when the process starts and the time when the process ends and then work out
 * the duration. Doing that with JavaScript time constructs though gets very messy and we want to avoid bringing in
 * 3rd party packages for just this one thing.
 *
 * Unfortunately, we cannot find the original source but a 'neat' way of doing it is to use
 * {@link https://nodejs.org/api/process.html#processhrtimebigint | process.hrtime.bigint()} which returns
 * "the current high-resolution real time in nanoseconds".
 *
 * Do the same at the end and take one from the other, and you then have the duration in nanoseconds which you can
 * easily convert into something more readable.
 *
 * @returns {bigint} the current time in nanoseconds
 */
function currentTimeInNanoseconds () {
  return process.hrtime.bigint()
}

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
 * Tests if one set of periods (represented by a start and end date) overlaps with another
 *
 * Added as part of two-part tariff and the need to match returns and lines to charge elements. A common complication in
 * WRLS is the need to convert an abstract period, for example '1 Nov to 31 Mar' to a concrete period (2023-11-01 to
 * 2024-03-31). It gets even more complex when the period crosses over another, for example the start or end of a
 * billing period. Then the only way to represent the abstract period in a usable way is as 2 separate periods. Hence
 * this service deals with arrays of periods.
 *
 * > See the comments for `DetermineAbstractionPeriodService` to better understand the complexity of going from
 * > abstract to concrete periods
 *
 * Then there are times we need to test if the periods of one thing overlap with another. In two-part tariff that's the
 * abstraction periods of a charge element with those of a return. If _any_ of the periods overlap then the return is
 * 'matched' and can be allocated to the charge element.
 *
 * This method iterates through the `referencePeriods`. It then filters the `checkPeriods` by testing if any of them
 * overlap with the `referencePeriod`. If any do `checkPeriods.filter()` will return a non-empty array at which point
 * `periodsOverlap()` will return `true`.
 *
 * Else, having compared all the `checkPeriods` against each `referencePeriod` and finding no overlaps the function will
 * return false.
 *
 * @param {Object[]} referencePeriods Each period is an object containing a `startDate` and `endDate` property
 * @param {Object[]} checkPeriods Each period is an object containing a `startDate` and `endDate` property. These
 * periods will be checked against the `referencePeriods for any overlaps
 *
 * @returns {boolean} Returns true if there _any_ check period overlaps with a reference period, else false
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
  currentTimeInNanoseconds,
  generateUUID,
  periodsOverlap,
  timestampForPostgres
}
