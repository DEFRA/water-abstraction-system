'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnLogsFixture = require('../../fixtures/return-logs.fixture.js')

// Thing under test
const DownloadReturnLogPresenter = require('../../../app/presenters/return-logs/download-return-log.presenter.js')

describe('Return Logs - Download Return Log presenter', () => {
  let testReturnLog

  before(() => {
    testReturnLog = ReturnLogsFixture.returnLog('abstractionVolumes')
  })

  describe('the "data" property', () => {
    describe('when provided with a returnLog with a returnSubmission.method of "abstractionVolumes"', () => {
      it('correctly formats the data into a CSV string where the "reading" column is empty, with the first row as headers and the subsequent rows containing values corresponding to each column', () => {
        const result = DownloadReturnLogPresenter.go(testReturnLog)

        const rows = result.data.split('\n')

        expect(rows[0]).to.equal('start date,reading,volume')
        expect(rows[1]).to.equal('2022-11-01,,123')
        expect(rows[2]).to.equal('2022-12-01,,456')
        expect(rows[3]).to.equal('2023-01-01,,789')
      })
    })

    describe('when provided with a returnLog with a returnSubmission.method of other than "abstractionVolumes"', () => {
      before(() => {
        testReturnLog = ReturnLogsFixture.returnLog('NOT_ABSTRACTION_VOLUMES')
      })

      it('correctly formats the data into a CSV string, with the first row as headers and the subsequent rows containing values corresponding to each column', () => {
        const result = DownloadReturnLogPresenter.go(testReturnLog)

        const rows = result.data.split('\n')

        expect(rows[0]).to.equal('start date,reading,volume')
        expect(rows[1]).to.equal('2022-11-01,321,123')
        expect(rows[2]).to.equal('2022-12-01,654,456')
        expect(rows[3]).to.equal('2023-01-01,987,789')
      })
    })
  })

  describe('the "filename" property', () => {
    it('returns the formatted name for the csv file in the following format: returnReference_startDate_endDate_version', () => {
      const result = DownloadReturnLogPresenter.go(testReturnLog)

      expect(result.filename).to.equal('10055412_2022-11-01_2023-10-31_v2.csv')
    })
  })
})
