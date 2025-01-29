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
    session = await SessionHelper.add({ data: { returnReference: '1234' } })

    yarStub = { flash: Sinon.stub().returns([]) }
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await CheckService.go(session.id, yarStub)

      expect(result).to.equal({
        activeNavBar: 'search',
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
        returnReference: '1234',
        sessionId: session.id
      })
    })

    it('updates the session record to indicate user has visited the "check" page', async () => {
      await CheckService.go(session.id, yarStub)

      const refreshedSession = await session.$query()

      expect(refreshedSession.checkPageVisited).to.be.true()
    })
  })
})
