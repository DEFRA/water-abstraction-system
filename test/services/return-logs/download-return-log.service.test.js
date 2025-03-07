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
const ReturnLogsFixtures = require('../../fixtures/return-logs.fixture.js')

// Thing under test
const DownloadReturnLogService = require('../../../app/services/return-logs/download-return-log.service.js')

describe('Download Return Log Service', () => {
  let returnLog

  before(() => {
    returnLog = ReturnLogsFixtures.returnLog()

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
