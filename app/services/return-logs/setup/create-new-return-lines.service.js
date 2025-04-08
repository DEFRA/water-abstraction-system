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
 *
 * @returns
 */
async function go(lines, returnSubmissionId) {
  if (!lines || !lines.length) {
    return
  }

  const returnLines = lines.map((line) => ({
    ...line,
    id: generateUUID(),
    returnSubmissionId
  }))

  return ReturnSubmissionLineModel.query().insert(returnLines)
}

module.exports = {
  go
}
