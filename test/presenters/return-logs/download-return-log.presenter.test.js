'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnLogModel = require('../../../app/models/return-log.model.js')
const ReturnSubmissionModel = require('../../../app/models/return-submission.model.js')
const ReturnSubmissionLineModel = require('../../../app/models/return-submission-line.model.js')

// Thing under test
const DownloadReturnLogPresenter = require('../../../app/presenters/return-logs/download-return-log.presenter.js')

describe('Download Return presenter', () => {
  let returnLog

  beforeEach(() => {
    returnLog = _testReturnLog()
  })

  describe('the "data" property', () => {
    describe('when provided with a returnLog with a returnSubmission.method of "abstractionVolumes"', () => {
      it('correctly formats the data to a csv string', () => {
        const result = DownloadReturnLogPresenter.go(returnLog)

        expect(result.data).to.equal('start date,reading,volume\n2022-11-01,,123\n2022-12-01,,456\n2023-01-01,,789\n')
      })
    })

    describe('when provided with a returnLog with a returnSubmission.method of other than "abstractionVolumes"', () => {
      beforeEach(() => {
        returnLog.returnSubmissions[0].method = 'NOT_ABSTRACTION_VOLUMES'
      })

      it('correctly formats the data to a csv string', () => {
        const result = DownloadReturnLogPresenter.go(returnLog)

        expect(result.data).to.equal('start date,reading,volume\n2022-11-01,,123\n2022-12-01,,456\n2023-01-01,,789\n')
      })
    })
  })

  describe('the "filename" property', () => {
    it('returns the formatted name for the csv file', () => {
      const result = DownloadReturnLogPresenter.go(returnLog)

      expect(result.filename).to.equal('10055412_2022-11-01_2023-10-31_v2.csv')
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
