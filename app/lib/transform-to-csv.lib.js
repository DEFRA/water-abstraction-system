'use strict'

/**
 * Transforms an array into a CSV formatted string.
 *
 * A CSV header / row is the same regardless of transformation. The header is commonly the first row.
 * Therefore, this function works for both a header and rows.
 *
 * The function can transform most common types:
 * - Objects are stringified and parsed
 * - Numbers are converted to strings
 * - Booleans are converted to strings
 * - Falsey values are converted to empty strings
 * - Dates are converted into ISO string format
 * - Strings are escaped to handle special characters (e.g., ',', '/', '.', '\\', '"', '\n')
 *
 * @param {Array} arrayToTransform - An array of data to transform. Each element can be of any type (string, number, object, boolean, date, etc.)
 *
 * @returns {string} A CSV formatted string with each value separated by commas, and rows separated by newline characters (`\n`).
 *
 * @private
 */
function TransformArrayToCSVRow(arrayToTransform) {
  if (!arrayToTransform) {
    return undefined
  }

  const transformedArrayToRow = arrayToTransform
    .map((value) => {
      return _transformValueToCSV(value)
    })
    .join(',')

  return transformedArrayToRow + '\n'
}

/**
 * Transform a value to CSV format
 *
 * @private
 */
function _transformValueToCSV(value) {
  // Return empty string for undefined or null values
  if (!value && value !== false) {
    return ''
  }

  // Return ISO date if value is a date object
  if (value instanceof Date) {
    return value.toISOString()
  }

  // Return integers and booleans as they are (not converted to a string)
  if (Number.isInteger(value) || typeof value === 'boolean') {
    return `${value}`
  }

  // Return objects by serializing them to JSON
  if (typeof value === 'object') {
    const objectToString = JSON.stringify(value)

    const escapedObjectToString = objectToString.replace(/"/g, '""').replace(/:/g, ': ').replace(/,/g, ', ')

    return `"${escapedObjectToString}"`
  }

  // Return strings by quoting them and escaping any double quotes
  const stringValue = value.toString().replace(/"/g, '""')

  return `"${stringValue}"`
}

module.exports = {
  TransformArrayToCSVRow
}
