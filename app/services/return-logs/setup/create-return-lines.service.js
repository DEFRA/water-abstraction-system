'use strict'

/**
 * Creates new return lines by formatting the provided lines and inserting them into the database
 * @module CreateReturnLinesService
 */

const ReturnSubmissionLineModel = require('../../../models/return-submission-line.model.js')
const { generateUUID } = require('../../../lib/general.lib.js')

/**
 * Creates return lines by formatting the provided lines and inserting them into the database
 *
 * @param {string} returnSubmissionId - The ID of the return submission
 * @param {object} session - Session object containing the return submission data
 * @param {Date} timestamp - The timestamp to use for the createdAt property
 * @param {object} [trx=null] - Optional {@link https://vincit.github.io/objection.js/guide/transactions.html#transactions | transaction object}
 *
 * @returns {Promise<module:ReturnSubmissionLineModel[]>} - The created return lines (empty if nil return)
 */
async function go(returnSubmissionId, session, timestamp, trx = null) {
  if (session.journey === 'nilReturn') {
    return []
  }

  const returnLines = _returnLines(returnSubmissionId, session, timestamp)

  return ReturnSubmissionLineModel.query(trx).insert(returnLines)
}

function _returnLines(returnSubmissionId, session, timestamp) {
  return session.lines.map((line) => {
    // We use destructuring to remove the quantityCubicMetres and reading properties as these are not a valid db columns
    const { quantityCubicMetres, reading, ...restOfLine } = line

    return {
      ...restOfLine,
      id: generateUUID(),
      createdAt: timestamp,
      quantity: line.quantityCubicMetres,
      readingType: session.meterProvided === 'yes' ? 'measured' : 'estimated',
      returnSubmissionId,
      timePeriod: session.returnsFrequency,
      userUnit: session.unitSymbol
    }
  })
}

module.exports = {
  go
}
