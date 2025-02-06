'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')
const ReturnLogModel = require('../../../../app/models/return-log.model.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const ConfirmationService = require('../../../../app/services/return-logs/setup/confirmation.service.js')

describe('Return Logs Setup - Confirmation service', () => {
  let session

  before(async () => {
    session = await SessionHelper.add({
      data: {
        status: 'due',
        dueDate: '2019-06-09T00:00:00.000Z',
        endDate: '2019-05-12T00:00:00.000Z',
        journey: 'record-receipt',
        purposes: 'Mineral Washing',
        licenceId: '91aff99a-3204-4727-86bd-7bdf3ef24533',
        startDate: '2019-04-01T00:00:00.000Z',
        licenceRef: '01/117',
        underQuery: false,
        returnLogId: 'v1:6:01/117:10032788:2019-04-01:2019-05-12',
        beenReceived: false,
        periodEndDay: 30,
        receivedDate: '2025-02-05T00:00:00.000Z',
        twoPartTariff: false,
        periodEndMonth: 9,
        periodStartDay: 1,
        returnReference: '10032788',
        siteDescription: 'Addington Sandpits',
        periodStartMonth: 10,
        receivedDateOptions: 'yesterday',
        confirmationPageVisited: true
      }
    })

    await ReturnLogHelper.add({ id: session.data.returnLogId })
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ConfirmationService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        backLink: '/system/licences/91aff99a-3204-4727-86bd-7bdf3ef24533/returns',
        licenceRef: '01/117',
        pageTitle: 'Return 10032788 received',
        purposes: 'Mineral Washing',
        sessionId: session.id,
        siteDescription: 'Addington Sandpits'
      })
    })

    it('updates the session record to indicate user has visited the "confirmation" page', async () => {
      await ConfirmationService.go(session.id)

      const refreshedSession = await session.$query()

      expect(refreshedSession.confirmationPageVisited).to.be.true()
    })

    it('updates the return log record status to "completed" and receivedDate to the value in the session', async () => {
      await ConfirmationService.go(session.id)

      const returnLog = await ReturnLogModel.query().findById(session.data.returnLogId)

      expect(returnLog.status).to.equal('completed')
      expect(returnLog.receivedDate).to.equal(new Date(session.data.receivedDate))
    })
  })
})
