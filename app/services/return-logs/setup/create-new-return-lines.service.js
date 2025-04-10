'use strict'

/**
 * Creates new return lines
 * @module CreateNewReturnLinesService
 */

const { generateUUID } = require('../../../lib/general.lib.js')
const ReturnSubmissionLineModel = require('../../../models/return-submission-line.model.js')

/**
 * TODO: Document
 *
 * @param lines
 * @param returnSubmissionId
 * @param trx
 *
 * @returns
 */
async function go(lines, returnSubmissionId, trx = null) {
  if (!lines || !lines.length) {
    return
  }

  const returnLines = lines.map((line) => ({
    ...line,
    id: generateUUID(),
    returnSubmissionId
  }))

  return ReturnSubmissionLineModel.query(trx).insert(returnLines)
}

module.exports = {
  go
}
