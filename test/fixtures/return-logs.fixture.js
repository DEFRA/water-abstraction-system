'use strict'

const ReturnLogModel = require('../../app/models/return-log.model.js')
const ReturnSubmissionModel = require('../../app/models/return-submission.model.js')
const ReturnSubmissionLineModel = require('../../app/models/return-submission-line.model.js')

/**
 * Represents a complete response from `FetchDownloadReturnLogService`
 *
 * @param {string} method - The method for the return submission, which is set to 'abstractionVolumes' by default but
 * can be passed other methods.
 *
 * @returns {<module:ReturnLogModel>} a returnLog instance with its related returnSubmission and returnSubmissionLines
 */
function returnLog(method = 'abstractionVolumes') {
  const returnSubmissionLineOne = ReturnSubmissionLineModel.fromJson({
    id: '5215fc36-b3da-44db-8d21-77f9f180a213',
    startDate: new Date('2022-11-01T00:00:00.000Z'),
    quantity: 123,
    reading: 321
  })

  const returnSubmissionLineTwo = ReturnSubmissionLineModel.fromJson({
    id: 'db1df580-3381-43af-9751-3f842833373f',
    startDate: new Date('2022-12-01T00:00:00.000Z'),
    quantity: 456,
    reading: 654
  })

  const returnSubmissionLineThree = ReturnSubmissionLineModel.fromJson({
    id: '9f22d3b4-769e-4856-8591-8a890e8c45fe',
    startDate: new Date('2023-01-01T00:00:00.000Z'),
    quantity: 789,
    reading: 987
  })

  const returnSubmission = ReturnSubmissionModel.fromJson({
    id: 'a9909721-1110-4c3c-9b18-e92389b9af00',
    metadata: {
      type: 'estimated',
      total: 22.918,
      units: 'Ml',
      meters: [],
      method,
      totalFlag: true,
      totalCustomDates: false
    },
    version: 2,
    returnSubmissionLines: [returnSubmissionLineOne, returnSubmissionLineTwo, returnSubmissionLineThree]
  })

  const returnLog = ReturnLogModel.fromJson({
    id: 'v1:6:11/42/18.6.3/295:10055412:2022-11-01:2023-10-31',
    returnReference: '10055412',
    startDate: new Date('2022-11-01T00:00:00.000Z'),
    endDate: new Date('2023-10-31T00:00:00.000Z'),
    returnSubmissions: [returnSubmission]
  })

  return returnLog
}

module.exports = {
  returnLog
}
