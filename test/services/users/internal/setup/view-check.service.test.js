'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const SessionModelStub = require('../../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../../app/dal/fetch-session.dal.js')

// Thing under test
const ViewCheckService = require('../../../../../app/services/users/internal/setup/view-check.service.js')

describe('Users - Internal - Setup - Check Service', () => {
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    sessionData = {
      email: 'bob.bobbles@environment-agency.gov.uk',
      permission: 'billing_and_data'
    }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)

    yarStub = { flash: Sinon.stub().returns([]) }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewCheckService.go(session.id, yarStub)

      expect(result).toEqual({
        access: null,
        activeNavBar: 'users',
        email: session.email,
        links: {
          access: `/system/users/internal/setup/${session.id}/access`,
          cancel: `/system/users/internal/setup/${session.id}/cancel`,
          email: `/system/users/internal/setup/${session.id}/email`,
          permissions: `/system/users/internal/setup/${session.id}/permissions`
        },
        notification: undefined,
        pageTitle: 'Check user',
        pageTitleCaption: 'Internal',
        permission: 'Billing and Data',
        showEmailChangeLink: true
      })
    })

    it('sets the "checkPageVisited" flag to "true"', async () => {
      await ViewCheckService.go(session.id, yarStub)

      expect(session.checkPageVisited).toBe(true)
      expect(session.$update.called).toBe(true)
    })

    describe('when there is a notification', () => {
      beforeEach(() => {
        yarStub = { flash: Sinon.stub().returns(['Test notification']) }
      })

      it('sets the notification', async () => {
        const result = await ViewCheckService.go(session.id, yarStub)

        expect(result.notification).toEqual('Test notification')
      })
    })
  })
})
