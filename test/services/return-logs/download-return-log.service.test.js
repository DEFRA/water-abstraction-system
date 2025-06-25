'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { formatDateObjectToISO } = require('../../../app/lib/dates.lib.js')
const ReturnLogsFixture = require('../../fixtures/return-logs.fixture.js')

// Things we need to stub
const FetchDownloadReturnLogService = require('../../../app/services/return-logs/fetch-download-return-log.service.js')

// Thing under test
const DownloadReturnLogService = require('../../../app/services/return-logs/download-return-log.service.js')

describe('Return Logs - Download Return Log Service', () => {
  let returnLog

  before(() => {
    returnLog = ReturnLogsFixture.returnLog('month')
    returnLog.returnSubmissions = [ReturnLogsFixture.returnSubmission(returnLog, 'estimated')]

    Sinon.stub(FetchDownloadReturnLogService, 'go').resolves(returnLog)
  })

  it('correctly returns the csv string, filename and type', async () => {
    const result = await DownloadReturnLogService.go(returnLog.id)

    const { endDate, returnReference, returnSubmissions, startDate } = returnLog

    const expectedData = returnSubmissions[0].returnSubmissionLines.reduce((acc, line) => {
      const { quantity, startDate } = line

      return `${acc}${formatDateObjectToISO(startDate)},,${quantity}\n`
    }, 'start date,reading,volume\n')

    const expectedFilename = `${returnReference}_${formatDateObjectToISO(startDate)}_${formatDateObjectToISO(endDate)}_v${returnSubmissions[0].version}.csv`

    expect(result).to.equal({
      data: expectedData,
      filename: expectedFilename,
      type: 'text/csv'
    })
  })
})
