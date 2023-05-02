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
function go (headers, rows) {
  const transformedHeaders = _transformDataToCSV([headers])[0]

  if (!rows) {
    return transformedHeaders
  }

  const transformedRows = _transformDataToCSV(rows)
  const dataToCSV = _joinHeaderAndRows(transformedHeaders, transformedRows)

  return dataToCSV
}

/**
 * Transforms each row to CSV format and joins the values with commas
 *
 * @param {[*]} rows The data to be transformed to CSV
 *
 * @returns {String[]} An array of transformed data
 */
function _transformDataToCSV (rows) {
  const transformedRows = []

  rows.forEach((row) => {
    const transformedRow = row.map((value) => {
      return _transformValueToCSV(value)
    }).join(',')
    transformedRows.push(transformedRow)
  })

  return transformedRows
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
    return JSON.stringify(value)
  }

  // Return strings by quoting them and escaping any double quotes
  const stringValue = value.toString().replace(/"/g, '""')

  return `"${stringValue}"`
}

function _joinHeaderAndRows (header, rows) {
  return [header, ...rows].join('\n')
}

module.exports = {
  go
}
