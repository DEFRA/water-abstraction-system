'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { formatDateObjectToISO } = require('../../../app/lib/dates.lib.js')
const ReturnLogsFixture = require('../../fixtures/return-logs.fixture.js')

// Thing under test
const DownloadReturnLogPresenter = require('../../../app/presenters/return-logs/download-return-log.presenter.js')

describe('Return Logs - Download Return Log presenter', () => {
  let returnLog

  describe('the "data" property', () => {
    describe('when provided with a returnLog submitted using "abstraction volumes"', () => {
      before(() => {
        returnLog = ReturnLogsFixture.returnLog('month')
        returnLog.returnSubmissions = [ReturnLogsFixture.returnSubmission(returnLog, 'estimated')]
      })

      it('correctly formats the data into a CSV string where the "reading" column is empty', () => {
        const result = DownloadReturnLogPresenter.go(returnLog)

        const rows = result.data.split('\n')

        expect(rows[0]).to.equal('end date,reading,volume')

        // Drop the first header row
        rows.shift()
        // Drop the last blank line row
        rows.pop()

        for (let i = 0; i < rows.length - 1; i++) {
          const { quantity, endDate } = returnLog.returnSubmissions[0].returnSubmissionLines[i]

          expect(rows[i]).to.equal(`${formatDateObjectToISO(endDate)},,${quantity}`)
        }
      })
    })

    describe('when provided with a returnLog submitted using "readings"', () => {
      before(() => {
        returnLog = ReturnLogsFixture.returnLog('month')
        returnLog.returnSubmissions = [ReturnLogsFixture.returnSubmission(returnLog, 'measured')]
      })

      it('correctly formats the data into a CSV string where the "reading" column is empty', () => {
        const result = DownloadReturnLogPresenter.go(returnLog)

        const rows = result.data.split('\n')

        expect(rows[0]).to.equal('end date,reading,volume')

        // Drop the first header row
        rows.shift()
        // Drop the last blank line row
        rows.pop()

        for (let i = 0; i < rows.length - 1; i++) {
          const { quantity, reading, endDate } = returnLog.returnSubmissions[0].returnSubmissionLines[i]

          expect(rows[i]).to.equal(`${formatDateObjectToISO(endDate)},${reading},${quantity}`)
        }
      })
    })
  })

  describe('the "filename" property', () => {
    before(() => {
      returnLog = ReturnLogsFixture.returnLog('month')
      returnLog.returnSubmissions = [ReturnLogsFixture.returnSubmission(returnLog, 'estimated')]
    })

    it('returns the name in the format: returnReference_startDate_endDate_version', () => {
      const result = DownloadReturnLogPresenter.go(returnLog)

      const { endDate, returnReference, returnSubmissions, startDate } = returnLog
      const { version } = returnSubmissions[0]

      expect(result.filename).to.equal(
        `${returnReference}_${formatDateObjectToISO(startDate)}_${formatDateObjectToISO(endDate)}_v${version}.csv`
      )
    })
  })
})
