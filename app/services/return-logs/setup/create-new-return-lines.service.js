'use strict'

/**
 * Creates new return lines
 * @module CreateNewReturnLinesService
 */

const { generateUUID, timestampForPostgres } = require('../../../lib/general.lib.js')
const ReturnSubmissionLineModel = require('../../../models/return-submission-line.model.js')

const UNIT_NAMES = {
  'cubic-metres': 'm³',
  litres: 'l',
  megalitres: 'Ml',
  gallons: 'gal'
}

/**
 * TODO: Document
 *
 * @param lines
 * @param returnSubmissionId
 * @param returnsFrequency
 * @param units
 * @param reported
 * @param trx
 *
 * @returns
 */
async function go(lines, returnSubmissionId, returnsFrequency, units, reported, trx = null) {
  if (!lines || !lines.length) {
    return
  }

  const returnLines = lines.map((line) => {
    return {
      ...line,
      reading: undefined,
      createdAt: timestampForPostgres(),
      id: generateUUID(),
      returnSubmissionId,
      timePeriod: returnsFrequency,
      readingType: reported === 'abstraction-volumes' ? 'estimated' : 'measured',
      userUnit: UNIT_NAMES[units]
    }
  })

  return ReturnSubmissionLineModel.query(trx).insert(returnLines)
}

module.exports = {
  go
}
