'use strict'

/**
 * @module ConvertToCSVService
 */

const FetchTableColumnNamesService = require('../db-export/fetch-table-column-names.service.js')

/**
 * Converts a table of data to a CSV- formatted string.
 * @param {Object[]} table - An array of objects representing the table data.
 * @returns {Promise<String>} - A promise that resolves with the CSV- formatted string.
 */
async function go (table) {
  // Fetch the column names from the table to create the headerRow of the csv
  const headerRows = await FetchTableColumnNamesService.go()

  // Returns just the column names if there are no rows of data
  if (table.length === 0) {
    return headerRows
  }

  // Transform the table data to an array of arrays with only the values
  const transformedValues = table.map((row) => {
    return Object.values(row)
  })

  // Transform each value to CSV format and join the values in each row with commas
  const csvRows = transformedValues.map((row) => {
    return row.map(transformValueToCsv).join(',')
  })

  // Join the header row and the CSV rows with line breaks and return the CSV-formatted string
  return `${headerRows}\n${csvRows.join('\n')}`
}

/**
 * Transform a value to CSV format
 * @param {*} value - The value to transform
 * @returns {String} - The value transformed to CSV format
 */
function transformValueToCsv (value) {
  // Returns an empty string for undefined or null values
  if (value === undefined || value === null || value === '') {
    return ''
  }

  // Handle objects by serializing them to JSON
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  // Handle strings by quoting them and escaping any double quotes
  const stringValue = value.toString().replace(/"/g, '""')
  return `"${stringValue}"`
}

module.exports = {
  go
}
