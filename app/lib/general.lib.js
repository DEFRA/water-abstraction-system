'use strict'

/**
 * General helper methods
 * @module GeneralLib
 */

const { randomUUID } = require('crypto')

/**
 * Calculates and logs the time taken in milliseconds between the provided `startTime` and the current time
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
 * Assuming a process recorded the start time using `currentTimeInNanoseconds()` when passed to this helper it will
 * work out the time taken in nanoseconds, convert that to milliseconds and seconds and output it as a log message.
 *
 * @param {bigint} startTime - the time the process started in nanoseconds
 * @param {string} message - the message to log
 * @param {object} [data] - additional data to include with the log output
 */
function calculateAndLogTimeTaken(startTime, message, data = {}) {
  const endTime = currentTimeInNanoseconds()
  const timeTakenNs = endTime - startTime
  const timeTakenMs = timeTakenNs / 1000000n
  const timeTakenSs = timeTakenMs / 1000n

  const logData = {
    timeTakenMs,
    timeTakenSs,
    ...data
  }

  global.GlobalNotifier.omg(message, logData)
}

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
function currentTimeInNanoseconds() {
  return process.hrtime.bigint()
}

/**
 * Determine the start and end date for the current financial year
 *
 * We often need to work out what the start and end date for the current financial year is. But because the financial
 * year starts on 01-APR and finishes on 31-MAR what that year is will change dependent on the current date.
 *
 * @returns {object} An object containing a `startDate` and `endDate`
 */
function determineCurrentFinancialYear() {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()

  let startYear
  let endYear

  // IMPORTANT! getMonth returns an integer (0-11). So, January is represented as 0 and December as 11. This is why
  // we use 2 rather than 3 to refer to March
  if (currentDate.getMonth() <= 2) {
    // For example, if currentDate was 2022-02-15 it would fall in financial year 2021-04-01 to 2022-03-31
    startYear = currentYear - 1
    endYear = currentYear
  } else {
    // For example, if currentDate was 2022-06-15 it would fall in financial year 2022-04-01 to 2023-03-31
    startYear = currentYear
    endYear = currentYear + 1
  }

  return { startDate: new Date(startYear, 3, 1), endDate: new Date(endYear, 2, 31) }
}

/**
 * Creates a flash notification using yar.
 *
 * This function adds a key/value to 'notification' in yar.
 *
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @param {string} [title='Updated'] - title for the notification
 * @param {string} [text='Changes made'] - text for the notification
 *
 */
function flashNotification(yar, title = 'Updated', text = 'Changes made') {
  yar.flash('notification', {
    title,
    text
  })
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
 * @returns {string} a randomly generated UUID
 */
function generateUUID() {
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
 * @param {object[]} referencePeriods - Each period is an object containing a `startDate` and `endDate` property
 * @param {object[]} checkPeriods - Each period is an object containing a `startDate` and `endDate` property. These
 * periods will be checked against the `referencePeriods for any overlaps
 *
 * @returns {boolean} Returns true if there _any_ check period overlaps with a reference period, else false
 */
function periodsOverlap(referencePeriods, checkPeriods) {
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
function timestampForPostgres() {
  return new Date().toISOString()
}

/**
 * Compare key properties of 2 transactions and determine if they are a 'match'
 *
 * We compare those properties which determine the charge value calculated by the charging module. If the properties
 * are the same we return true. Else we return false.
 *
 * This is used in the billing engines to determine 2 transactions within the same bill, often a debit and a credit,
 * and whether they match. If they do we don't send either to the charge module or include them in the bill as they
 * 'cancel' each other out.
 *
 * The key properties are charge type, category code, and billable days. But we also need to compare agreements and
 * additional charges because if those have changed, we need to credit the previous transaction and calculate the
 * new debit value.
 *
 * Because what we are checking does not match up to what you see in the UI we have this reference
 *
 * - Abatement agreement - section126Factor
 * - Two-part tariff agreement - section127Agreement
 * - Canal and River Trust agreement - section130Agreement
 * - Aggregate - aggregateFactor
 * - Charge Adjustment - adjustmentFactor
 * - Winter discount - winterOnly
 *
 * - Additional charges - supportedSource
 * - Additional charges - supportedSourceName
 * - Additional charges - waterCompanyCharge
 *
 * @param {object} left - First transaction to match
 * @param {object} right - Second transaction to match
 *
 * @returns {boolean} true if a match else false
 */
function transactionsMatch(left, right) {
  // When we put together this matching logic our instincts were to try and do something 'better' than this long,
  // chained `&&` statement. But whatever we came up with was
  //
  // - more complex
  // - less performant
  //
  // We also believe this makes it easy to see what properties are being compared. Plus the moment something doesn't
  // match we bail. So, much as it feels 'wrong', we are sticking with it!
  return (
    left.chargeType === right.chargeType &&
    left.chargeCategoryCode === right.chargeCategoryCode &&
    left.billableDays === right.billableDays &&
    left.section126Factor === right.section126Factor &&
    left.section127Agreement === right.section127Agreement &&
    left.section130Agreement === right.section130Agreement &&
    left.aggregateFactor === right.aggregateFactor &&
    left.adjustmentFactor === right.adjustmentFactor &&
    left.winterOnly === right.winterOnly &&
    left.supportedSource === right.supportedSource &&
    left.supportedSourceName === right.supportedSourceName &&
    left.waterCompanyCharge === right.waterCompanyCharge
  )
}

/**
 * Transforms a string of licences into an array of individual licence numbers.
 * The string can contain licence numbers separated by newlines or commas.
 *
 * This function replaces newlines with commas, then splits the string by commas,
 * and removes any empty strings from the result.
 *
 * ```javascript
 * transformStringOfLicencesToArray('123, 456, 789');
 * // Returns: ['123', '456', '789']
 *
 * transformStringOfLicencesToArray('123\n456,789');
 * // Returns: ['123', '456', '789']
 *
 * transformStringOfLicencesToArray('123\n456\n789');
 * // Returns: ['123', '456', '789']
 *
 * transformStringOfLicencesToArray('');
 * // Returns: ['']
 * ```
 *
 * @param {string} licences - A string containing one or more licence numbers
 *
 * @returns {string[]} - An array of licence numbers as strings.
 *
 */
function transformStringOfLicencesToArray(licences) {
  if (!licences) {
    return ['']
  }

  return licences
    .replace(/\n/g, ',') // Replace newlines with commas
    .split(',') // Split by commas
    .map((item) => item.trim()) // Trim any leading/trailing spaces
    .filter((item) => item !== '') // Remove empty strings if any
}

module.exports = {
  calculateAndLogTimeTaken,
  currentTimeInNanoseconds,
  determineCurrentFinancialYear,
  flashNotification,
  generateUUID,
  periodsOverlap,
  timestampForPostgres,
  transactionsMatch,
  transformStringOfLicencesToArray
}
