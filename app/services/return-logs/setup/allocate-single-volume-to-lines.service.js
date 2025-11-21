'use strict'

/**
 * Orchestrates allocating a single volume to return submission lines using the abstraction period dates given.
 * @module AllocateSingleVolumeToLinesService
 */

const Big = require('big.js')

const { convertFromCubicMetres, convertToCubicMetres } = require('../../../lib/general.lib.js')
const { returnUnits } = require('../../../lib/static-lookups.lib.js')

const MAX_DECIMAL = 6

/**
 * Orchestrates allocating a single volume to return submission lines using the abstraction period dates given.
 *
 * Each return has multiple return submission lines determined by the return period start and end date and the reporting
 * frequency of the return. We need to allocate the single volume to the lines within the abstraction period the user
 * has given.
 *
 * We first start by removing any existing quantity from the lines and then creating a new array that references all the
 * return lines covered by the abstraction period. We then divide the single volume by the length of this new array and
 * apply the quantity to each line within the abstraction period. To prevent rounding errors, we track the cumulative
 * sum using a variable called `roundingCounter` and record the index of the last applicable line (`lastIndex`). After
 * processing all lines, we adjust the last line's quantity if needed to ensure the total matches the original volume.
 *
 * @param {object} session - Session object containing the return submission data
 */
function go(session) {
  const { fromFullDate, lines, singleVolumeQuantity, toFullDate, units } = session

  const linesInsideAbstractionPeriod = _linesInsideAbstractionPeriod(fromFullDate, lines, toFullDate)

  const unitSymbol = _getUnitSymbolByName(units)

  const singleVolumeCubicMetres = convertToCubicMetres(singleVolumeQuantity, unitSymbol)

  const individualLineQuantity = _individualLineQuantity(
    linesInsideAbstractionPeriod,
    singleVolumeCubicMetres,
    unitSymbol
  )

  _applyQuantityToLines(individualLineQuantity, linesInsideAbstractionPeriod, singleVolumeCubicMetres, unitSymbol)
}

function _applyQuantityToLines(
  individualLineQuantity,
  linesInsideAbstractionPeriod,
  singleVolumeCubicMetres,
  unitSymbol
) {
  // Apply the quantity to each line within the abstraction period. Since volume is divided across multiple lines,
  // rounding errors may occur, causing the total to deviate from the original volume. To prevent this, we calculate the
  // total line quantity (`allocatedLineTotal`) and record the index of the last applicable line (`lastIndex`). After
  // processing all lines, we adjust the last line's quantity if needed to ensure the total matches the original volume.
  linesInsideAbstractionPeriod.forEach((line) => {
    line.quantity = individualLineQuantity.userUnit
    line.quantityCubicMetres = individualLineQuantity.cubicMetres
  })

  const allocatedLineTotal = Big(individualLineQuantity.cubicMetres)
    .times(linesInsideAbstractionPeriod.length)
    .round(MAX_DECIMAL, Big.roundHalfUp)
    .toNumber()

  if (allocatedLineTotal !== Number(singleVolumeCubicMetres)) {
    const roundingError = Big(singleVolumeCubicMetres).minus(allocatedLineTotal).toNumber()
    const lastIndex = linesInsideAbstractionPeriod.length - 1
    linesInsideAbstractionPeriod[lastIndex].quantityCubicMetres = Big(individualLineQuantity.cubicMetres)
      .plus(roundingError)
      .toNumber()

    linesInsideAbstractionPeriod[lastIndex].quantity = convertFromCubicMetres(
      linesInsideAbstractionPeriod[lastIndex].quantityCubicMetres,
      unitSymbol
    )
  }
}

function _getUnitSymbolByName(units) {
  return Object.keys(returnUnits).find((key) => {
    return returnUnits[key].name === units
  })
}

function _individualLineQuantity(linesInsideAbstractionPeriod, singleVolumeCubicMetres, unitSymbol) {
  const cubicMetres = Big(singleVolumeCubicMetres)
    .div(linesInsideAbstractionPeriod.length)
    .round(MAX_DECIMAL, Big.roundHalfUp)
    .toNumber()

  const individualLineQuantity = {
    cubicMetres,
    userUnit: convertFromCubicMetres(cubicMetres, unitSymbol)
  }

  return individualLineQuantity
}

function _linesInsideAbstractionPeriod(fromFullDate, lines, toFullDate) {
  const abstractionPeriodLines = []

  lines.forEach((line) => {
    // Delete any existing quantities
    delete line.quantity
    delete line.quantityCubicMetres

    if (_lineWithinAbstractionPeriod(line.startDate, line.endDate, fromFullDate, toFullDate)) {
      abstractionPeriodLines.push(line)
    }
  })

  return abstractionPeriodLines
}

function _lineWithinAbstractionPeriod(lineStartDate, lineEndDate, fromFullDate, toFullDate) {
  return lineStartDate >= fromFullDate && lineEndDate <= toFullDate
}

module.exports = {
  go
}
