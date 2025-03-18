'use strict'

/**
 * Splits and formats entries from the `/return-logs/{sessionId}/multiple-entries` page
 * @module SplitMultipleEntriesService
 */

/**
 * Splits and formats entries from the `/return-logs/{sessionId}/multiple-entries` page
 *
 * This function converts a string of multiple entries from the payload into an array of numbers or null values.
 * If the entries contain new lines (`\r\n` or `\n`), they are split by new lines. Otherwise, they are assumed to be
 * comma-separated and split by that instead. Any empty entries from the comma split are filtered out.
 * We then remove any commas or spaces from the entries to ensure we can convert them to numbers.
 * Numeric values are converted to `Number` type.
 * If the user has entered an `x` then we set this entry to `null`.
 *
 * @param {string} multipleEntries - The raw payload string containing multiple entries.
 *
 * @returns {Array<number>} The formatted array of numbers and null values.
 */
function go(multipleEntries) {
  const multipleEntriesSplit = multipleEntries.includes('\r\n')
    ? multipleEntries.split(/\r?\n/)
    : multipleEntries.split(',').filter(Boolean)

  return multipleEntriesSplit.map((entry) => {
    const strippedEntry = entry.replace(/\s/g, '').replace(/,/g, '')

    if (strippedEntry.toLowerCase() === 'x') {
      return null
    }

    return Number(strippedEntry)
  })
}

module.exports = {
  go
}
