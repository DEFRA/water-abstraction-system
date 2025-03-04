'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const FetchDownloadReturnLogService = require('../../../app/services/return-logs/fetch-download-return-log.service.js')

// Test helpers
const ReturnLogModel = require('../../../app/models/return-log.model.js')
const ReturnSubmissionModel = require('../../../app/models/return-submission.model.js')
const ReturnSubmissionLineModel = require('../../../app/models/return-submission-line.model.js')

// Thing under test
const DownloadReturnLogService = require('../../../app/services/return-logs/download-return-log.service.js')

describe('Download Return Log Service', () => {
  let returnLog

  before(() => {
    returnLog = _testReturnLog()

    Sinon.stub(FetchDownloadReturnLogService, 'go').resolves(returnLog)
  })

  it('correctly returns the csv string, filename and type', async () => {
    const result = await DownloadReturnLogService.go(returnLog.id)

    expect(result).to.equal({
      data: 'start date,reading,volume\n2022-11-01,,123\n2022-12-01,,456\n2023-01-01,,789\n',
      filename: '10055412_2022-11-01_2023-10-31_v2.csv',
      type: 'text/csv'
    })
  })
})

function _testReturnLog() {
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
      method: 'abstractionVolumes',
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
