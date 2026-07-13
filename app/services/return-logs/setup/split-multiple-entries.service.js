/**
 * Splits and formats entries from the `/return-logs/{sessionId}/multiple-entries` page
 * @module SplitMultipleEntriesService
 */

/**
 * Splits and formats entries from the `/return-logs/{sessionId}/multiple-entries` page
 *
 * This function converts a string of multiple entries from the payload into an array of numbers or null values. If the
 * entries contain new lines (`\r\n` or `\n`), they are split by new lines. Otherwise, they are assumed to be
 * comma-separated and split by that instead.
 *
 * Any empty entries from the comma split are filtered out. We then remove any commas or spaces from the entries to
 * ensure we can convert them to numbers. Numeric values are converted to `Number` type. If the user has entered an `x`
 * then we set this entry to `null`.
 *
 * @param {string} multipleEntries - The raw payload string containing multiple entries.
 *
 * @returns {number[] | null} The formatted array of numbers and null values.
 */
export default function (multipleEntries) {
  if (!multipleEntries) {
    return null
  }

  const splitEntriesWith = multipleEntries.includes('\r\n') ? /\r?\n/ : ','

  const splitEntries = multipleEntries.split(splitEntriesWith)

  const entries = []

  for (const splitEntry of splitEntries) {
    const strippedEntry = splitEntry.replaceAll(/\s/g, '').replaceAll(',', '')

    if (strippedEntry) {
      const entry = strippedEntry.toLowerCase() === 'x' ? null : Number(strippedEntry)

      entries.push(entry)
    }
  }

  return entries
}
