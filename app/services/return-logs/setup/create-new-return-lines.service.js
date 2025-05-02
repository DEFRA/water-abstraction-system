'use strict'

/**
 * Creates new return lines
 * @module CreateNewReturnLinesService
 */

const { generateUUID, timestampForPostgres } = require('../../../lib/general.lib.js')
const ReturnSubmissionLineModel = require('../../../models/return-submission-line.model.js')

const { returnUnits } = require('../../../lib/static-lookups.lib.js')

/**
 * TODO: Document
 *
 * @param lines
 * @param returnSubmissionId
 * @param returnsFrequency
 * @param units
 * @param meterProvided
 * @param trx
 *
 * @returns
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
