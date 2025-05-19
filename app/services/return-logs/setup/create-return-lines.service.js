'use strict'

/**
 * Creates new return lines by formatting the provided lines and inserting them into the database
 * @module CreateReturnLinesService
 */

const { generateUUID, timestampForPostgres } = require('../../../lib/general.lib.js')
const ReturnSubmissionLineModel = require('../../../models/return-submission-line.model.js')

const { returnUnits } = require('../../../lib/static-lookups.lib.js')

/**
 * Creates return lines by formatting the provided lines and inserting them into the database
 *
 * @param {object[]} lines - An array of line objects to be processed
 * @param {string} returnSubmissionId - The ID of the return submission
 * @param {string} returnsFrequency - The frequency of the returns (eg. 'day', 'week' etc.)
 * @param {string} units - The unit of measurement for the quantity (eg. 'cubic-metres' etc.)
 * @param {boolean} volumes - Indicates if lines contain volumes
 * @param {boolean} meterProvided - Indicates if a meter was provided (this is independent of whether lines contain
 * volumes or meter readings)
 * @param {number} startReading - The starting meter reading
 * @param {boolean} meter10TimesDisplay - Whether the meter is a 10x display
 * @param {object} [trx=null] - Optional {@link https://vincit.github.io/objection.js/guide/transactions.html#transactions | transaction object}
 *
 * @returns {Promise<module:ReturnSubmissionLineModel[]>} - The created return lines (empty if no lines were provided)
 */
async function go(
  lines,
  returnSubmissionId,
  returnsFrequency,
  units,
  volumes,
  meterProvided,
  startReading,
  meter10TimesDisplay,
  trx = null
) {
  if (!lines?.length) {
    return []
  }

  let previousReading = startReading ?? 0

  const returnLines = lines.map((line) => {
    const { rawQuantity, currentReading } = calculateLineQuantity(line, previousReading, volumes, meter10TimesDisplay)

    previousReading = currentReading

    // We use destructuring to remove the reading property as this is not a valid column in the db
    const { reading, ...restOfLine } = line

    return {
      ...restOfLine,
      id: generateUUID(),
      createdAt: timestampForPostgres(),
      quantity: rawQuantity ? _convertToCubicMetres(rawQuantity, units) : undefined,
      readingType: meterProvided ? 'measured' : 'estimated',
      returnSubmissionId,
      timePeriod: returnsFrequency,
      userUnit: _getUserUnit(units)
    }
  })

  return ReturnSubmissionLineModel.query(trx).insert(returnLines)
}

/**
 * Calculates the quantity for a line based on the provided parameters. If the line contains volumes, it uses the
 * quantity directly. If it contains meter readings, it calculates the difference between the current and previous
 * readings. If the meter has a 10x display, it multiplies the difference by 10.
 *
 * @param {object} line - The line to process
 * @param {number} previousReading - The last meter reading we encountered
 * @param {boolean} volumes - Indicates if the line contains volumes (vs meter readings)
 * @param {boolean} meter10TimesDisplay - Indicates if the meter is a 10x display
 * @returns {object} - An object containing the calculated quantity and the new previous reading
 */
function calculateLineQuantity(line, previousReading, volumes, meter10TimesDisplay) {
  const currentReading = line.reading ?? previousReading

  if (volumes) {
    return { rawQuantity: line.quantity, currentReading }
  }

  if (!line.reading) {
    return { rawQuantity: null, currentReading }
  }

  const multiplier = meter10TimesDisplay ? 10 : 1

  return {
    rawQuantity: (line.reading - previousReading) * multiplier,
    currentReading
  }
}

/**
 * Converts a quantity to cubic metres based on the provided unit, as we store quantities in the db in cubic metres
 *
 * @param {number} quantity - The quantity to convert
 * @param {string} units - The unit of measurement for the quantity
 *
 * @returns {number} The converted quantity in cubic metres
 */
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
