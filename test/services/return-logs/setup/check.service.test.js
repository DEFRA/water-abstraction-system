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
        meterProvided: 'no',
        receivedDate: '2025-01-31T00:00:00.000Z',
        reported: 'volumes',
        returnReference: '1234',
        units: 'megalitres'
      }
    })

    yarStub = { flash: Sinon.stub().returns([]) }
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await CheckService.go(session.id, yarStub)

      expect(result).to.equal({
        activeNavBar: 'search',
        meterMake: undefined,
        meterProvided: 'no',
        meterSerialNumber: undefined,
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
        returnReceivedDate: '31 January 2025',
        reportingFigures: 'Volumes',
        returnReference: '1234',
        sessionId: session.id,
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
