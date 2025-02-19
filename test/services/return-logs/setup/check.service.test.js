'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const CheckService = require('../../../../app/services/return-logs/setup/check.service.js')

describe('Return Logs Setup - Check service', () => {
  let session
  let yarStub

  before(async () => {
    session = await SessionHelper.add({
      data: {
        endDate: '2005-03-31T00:00:00.000Z',
        meterProvided: 'no',
        periodEndDay: 31,
        periodEndMonth: 12,
        periodStartDay: 1,
        periodStartMonth: 1,
        purposes: ['Evaporative Cooling'],
        receivedDate: '2025-01-31T00:00:00.000Z',
        reported: 'volumes',
        returnReference: '1234',
        siteDescription: 'POINT A, TEST SITE DESCRIPTION',
        startDate: '2004-04-01T00:00:00.000Z',
        twoPartTariff: false,
        units: 'megalitres'
      }
    })

    yarStub = { flash: Sinon.stub().returns([]) }
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await CheckService.go(session.id, yarStub)

      expect(result).to.equal({
        abstractionPeriod: '1 January to 31 December',
        activeNavBar: 'search',
        links: {
          cancel: `/system/return-logs/setup/${session.id}/cancel`,
          meterDetails: `/system/return-logs/setup/${session.id}/meter-provided`,
          nilReturn: `/system/return-logs/setup/${session.id}/submission`,
          received: `/system/return-logs/setup/${session.id}/received`,
          reported: `/system/return-logs/setup/${session.id}/reported`,
          units: `/system/return-logs/setup/${session.id}/units`
        },
        meterMake: undefined,
        meterProvided: 'no',
        meterSerialNumber: undefined,
        nilReturn: 'No',
        note: {
          actions: [
            {
              href: 'note',
              text: 'Add a note'
            }
          ],
          text: 'No notes added'
        },
        notification: undefined,
        pageTitle: 'Check details and enter new volumes or readings',
        purposes: 'Evaporative Cooling',
        returnReceivedDate: '31 January 2025',
        reportingFigures: 'Volumes',
        returnPeriod: '1 April 2004 to 31 March 2005',
        returnReference: '1234',
        siteDescription: 'POINT A, TEST SITE DESCRIPTION',
        tariff: 'Standard',
        units: 'Megalitres'
      })
    })

    it('updates the session record to indicate user has visited the "check" page', async () => {
      await CheckService.go(session.id, yarStub)

      const refreshedSession = await session.$query()

      expect(refreshedSession.checkPageVisited).to.be.true()
    })
  })
})
