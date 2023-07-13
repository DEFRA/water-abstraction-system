'use strict'

/**
 * Convert data to CSV format
 * @module ConvertToCSVService
 */

/**
 * Converts data to a CSV formatted string
 *
 * @param {String[]} headers An array containing the column names
 * @param {[[*]]} rows An array of arrays each representing a row from the table
 *
 * @returns {String} A CSV formatted string
 */
function go (data) {
  if (!data) {
    return
  }

  return _transformDataToCSV(data)
}

/**
 * Transforms each row to CSV format and joins the values with commas
 *
 * @param {[*]} rows The data to be transformed to CSV
 *
 * @returns {String[]} An array of transformed data
 */
function _transformDataToCSV (row) {
  const transformedRow = row.map((value) => {
    return _transformValueToCSV(value)
  }).join(',')

  return transformedRow + '\n'
}

/**
 * Transform a value to CSV format
 *
 * @param {*} value The value to transform
 *
 * @returns {*} The value transformed to CSV format
 */
function _transformValueToCSV (value) {
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

    const escapedObjectToString = objectToString.replace(/"/g, '""')
      .replace(/:/g, ': ')
      .replace(/,/g, ', ')

    return `"${escapedObjectToString}"`
  }

  // Return strings by quoting them and escaping any double quotes
  const stringValue = value.toString().replace(/"/g, '""')

  return `"${stringValue}"`
}

module.exports = {
  go
}
