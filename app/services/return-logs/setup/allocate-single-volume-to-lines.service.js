'use strict'

/**
 * Orchestrates allocating a single volume to return submission lines using the abstraction period dates given.
 * @module AllocateSingleVolumeToLinesService
 */

/**
 * Orchestrates allocating a single volume to return submission lines using the abstraction period dates given.
 *
 * Each return has multiple return submission lines determined by the return period start and end date and the reporting
 * frequency of the return. We need to allocate the single volume to the lines within the abstraction period the user
 * has given.
 *
 * We first start by working out how many lines the abstraction period covers. We then divide the single volume by this
 * and apply the quantity to each line within the abstraction period. To prevent rounding errors, we track the cumulative
 * sum using a variable called `roundingCounter` and record the index of the last applicable line (`lastIndex`). After
 * processing all lines, we adjust the last line's quantity if needed to ensure the total matches the original volume.
 *
 * @param {object[]} lines - An array of lines with startDate and endDate properties
 * @param {string} fromDate - The start date of the abstraction period
 * @param {string} toDate - The end date of the abstraction period
 * @param {number} singleVolume - The volume to allocate
 * @returns
 */
async function go(lines, fromDate, toDate, singleVolume) {
  const linesInsideAbstractionPeriod = _linesInsideAbstractionPeriod(lines, fromDate, toDate)

  const individualLineQuantity = singleVolume / linesInsideAbstractionPeriod.length

  _applyQuantityToLines(linesInsideAbstractionPeriod, individualLineQuantity, singleVolume)

  return lines
}

function _linesInsideAbstractionPeriod(lines, fromDate, toDate) {
  const abstractionPeriodLines = []

  lines.forEach((line) => {
    if (_lineWithinAbstractionPeriod(line.startDate, line.endDate, fromDate, toDate)) {
      abstractionPeriodLines.push(line)
    }
  })

  return abstractionPeriodLines
}

function _applyQuantityToLines(linesInsideAbstractionPeriod, individualLineQuantity, singleVolume) {
  let allocatedLineTotal = 0

  // Apply the quantity to each line within the abstraction period. Since volume is divided across multiple lines,
  // rounding errors may occur, causing the total to deviate from the original volume. To prevent this, we track the
  // cumulative sum using `roundingCounter` and record the index of the last applicable line (`lastIndex`). After
  // processing all lines, we adjust the last line's quantity if needed to ensure the total matches the original volume.
  linesInsideAbstractionPeriod.forEach((line) => {
    line.quantity = individualLineQuantity
    allocatedLineTotal = allocatedLineTotal + individualLineQuantity
  })

  if (allocatedLineTotal !== Number(singleVolume)) {
    const roundingError = singleVolume - allocatedLineTotal
    const lastIndex = linesInsideAbstractionPeriod.length - 1
    linesInsideAbstractionPeriod[lastIndex].quantity = linesInsideAbstractionPeriod[lastIndex].quantity + roundingError
  }
}

function _lineWithinAbstractionPeriod(lineStartDate, lineEndDate, fromFullDate, toFullDate) {
  return lineStartDate >= fromFullDate && lineEndDate <= toFullDate
}

module.exports = {
  go
}
