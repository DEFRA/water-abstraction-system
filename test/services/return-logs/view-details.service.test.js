'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnLogsFixture = require('../../support/fixtures/return-logs.fixture.js')
const ReturnLogHelper = require('../../support/helpers/return-log.helper.js')

// Things we need to stub
const FetchReturnLogDetailsService = require('../../../app/services/return-logs/fetch-return-log-details.service.js')

// Thing under test
const ViewDetailsService = require('../../../app/services/return-logs/view-details.service.js')

describe('Return Logs - View Details service', () => {
  let returnLog

  beforeEach(() => {
    returnLog = ReturnLogsFixture.returnLog('month', true)
    returnLog.returnSubmissions = []

    const metadata = {
      ...ReturnLogHelper.defaults().metadata,
      purposes: [
        {
          alias: 'PURPOSE_ALIAS',
          tertiary: { code: '330', description: 'PURPOSE_DESCRIPTION' }
        }
      ]
    }

    returnLog.siteDescription = metadata.description
    returnLog.periodStartDay = metadata.periodStartDay
    returnLog.periodStartMonth = metadata.periodStartMonth
    returnLog.periodEndDay = metadata.periodEndDay
    returnLog.periodEndMonth = metadata.periodEndMonth
    returnLog.purposes = metadata.purposes
    returnLog.current = metadata.isCurrent
    returnLog.twoPartTariff = metadata.isTwoPartTariff

    Sinon.stub(FetchReturnLogDetailsService, 'go').resolves(returnLog)
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('correctly fetches return log, return log notifications and transforms it via the presenter', async () => {
    const result = await ViewDetailsService.go(returnLog.id, { credentials: { scope: ['returns'] } }, 'RETURN_ID', 0)

    expect(result).to.equal({
      activeSecondaryNav: 'details',
      abstractionPeriod: '',
      actionButton: {
        value: returnLog.id,
        text: 'Submit return'
      },
      backLink: {
        href: `/system/licences/${returnLog.licence.id}/returns`,
        text: 'Go back to summary'
      },
      displayReadings: true,
      displayTable: false,
      displayTotal: false,
      displayUnits: true,
      downloadCSVLink: null,
      meterDetails: null,
      method: undefined,
      nilReturn: false,
      notification: null,
      pageTitle: 'Return details',
      pageTitleCaption: `Licence ${returnLog.licence.licenceRef}`,
      purpose: ['PURPOSE_DESCRIPTION (PURPOSE_ALIAS)'],
      receivedDate: null,
      returnReference: returnLog.returnReference,
      returnPeriod: '1 April 2022 to 31 March 2023',
      showUnderQuery: true,
      siteDescription: returnLog.siteDescription,
      startReading: null,
      status: 'open',
      succeeded: false,
      summaryTableData: null,
      tableTitle: null,
      tariff: 'Standard',
      total: '0',
      underQuery: returnLog.underQuery,
      versions: null,
      warning: null
    })
  })
})
