'use strict'

/**
 * Convert data to CSV format
 * @module ConvertToCSVService
 */

/**
 * Converts data to a CSV- formatted string.
 * @param {Object[]} - An array of two items containing the column names and objects representing the tables data.
 * @returns {Promise<String>} - A promise that resolves with the CSV- formatted string.
 */
async function go (data) {
  const headerRows = data[0]
  const dataRows = data[1]

  // Returns just the column names formatted to CSV if there are no rows of data
  if (!dataRows) {
    return _generateHeader(headerRows)
  }

  // Transform the table data to an array of arrays with only the values
  const transformedValues = dataRows.map((row) => {
    return Object.values(row)
  })

  // Transform each value to CSV format and join the values in each row with commas
  const csvRows = transformedValues.map((row) => {
    return row.map(transformValueToCsv).join(',')
  })

  // Join the header row and the CSV rows with line breaks and return the CSV-formatted string
  return `${_generateHeader(headerRows)}\n${csvRows.join('\n')}`
}

/**
 * Transform a value to CSV format
 * @param {*} value - The value to transform
 * @returns {String} - The value transformed to CSV format
 */
function transformValueToCsv (value) {
  // Returns an empty string for undefined or null values
  if (!value && value !== false) {
    return ''
  }

  // Handles date objects to return them in a timestamp format
  if (value instanceof Date) {
    return value.toISOString()
  }

  // Handles numbers and booleans returning them in the same format
  if (Number.isInteger(value) || typeof value === 'boolean') {
    return `${value}`
  }

  // Handle objects by serializing them to JSON
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  // Handle strings by quoting them and escaping any double quotes
  const stringValue = value.toString().replace(/"/g, '""')
  return `"${stringValue}"`
}

/**
 * Generates a header formatted to CSV for the column names.
 * @param {Object} columnNames - An object containing the column names.
 * @returns {String} - A string representing the formatted header for the column names
 */
function _generateHeader (columnNames) {
  const columnNameArray = Object.keys(columnNames)
  const formattedColumnNames = columnNameArray.map((column) => {
    return `"${column}"`
  })
  return formattedColumnNames.join(',')
}

module.exports = {
  go
}
