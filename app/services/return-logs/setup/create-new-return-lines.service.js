'use strict'

/**
 * Creates new return lines by formatting the provided lines and inserting them into the database.
 * @module CreateNewReturnLinesService
 */

const { generateUUID, timestampForPostgres } = require('../../../lib/general.lib.js')
const ReturnSubmissionLineModel = require('../../../models/return-submission-line.model.js')

const { returnUnits } = require('../../../lib/static-lookups.lib.js')

/**
 * Creates new return lines by formatting the provided lines and inserting them into the database.
 *
 * @param {object[]} lines - An array of line objects to be processed.
 * @param {string} returnSubmissionId - The ID of the return submission.
 * @param {string} returnsFrequency - The frequency of the returns (eg. 'day', 'week' etc.).
 * @param {string} units - The unit of measurement for the quantity (eg. 'cubic-metres' etc.).
 * @param {string} meterProvided - Indicates if a meter was provided ('yes' or 'no').
 * @param {objection.transaction} [trx] - Optional transaction object.
 *
 * @returns {module:ReturnSubmissionLineModel[]} - The created return lines.
 */
async function go(lines, returnSubmissionId, returnsFrequency, units, meterProvided, trx = null) {
  if (!lines || !lines.length) {
    return
  }

  const returnLines = lines.map((line) => {
    return {
      ...line,
      quantity: line.quantity ? _convertToCubicMetres(line.quantity, units) : undefined,
      reading: undefined,
      createdAt: timestampForPostgres(),
      id: generateUUID(),
      returnSubmissionId,
      timePeriod: returnsFrequency,
      readingType: meterProvided === 'no' ? 'estimated' : 'measured',
      userUnit: _getUserUnit(units)
    }
  })

  return ReturnSubmissionLineModel.query(trx).insert(returnLines)
}

function _convertToCubicMetres(quantity, units) {
  const { multiplier } = Object.values(returnUnits).find((unit) => {
    return unit.name === units
  })

  return quantity / multiplier
}

/**
 * Convert a unit name to the form we persist as `user_unit` ie. from `cubic-metres` to `m³`
 *
 * @param {string} unit - The unit name to convert
 *
 * @returns {string|undefined} The symbol for the unit or undefined if not found
 */
function _getUserUnit(unit) {
  const entries = Object.entries(returnUnits)

  const foundEntry = entries.find(([_, value]) => {
    return value.name === unit
  })

  return foundEntry ? foundEntry[0] : undefined
}

module.exports = {
  go
}
