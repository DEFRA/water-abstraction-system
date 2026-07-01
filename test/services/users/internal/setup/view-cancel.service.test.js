'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const SessionModelStub = require('../../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../../app/dal/fetch-session.dal.js')

// Thing under test
const ViewCancelService = require('../../../../../app/services/users/internal/setup/view-cancel.service.js')

describe('Users - Internal - Setup - View Cancel Service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      email: 'bob.bobbles@environment-agency.gov.uk',
      permission: 'billing_and_data'
    }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewCancelService.go(session.id)

      expect(result).toEqual({
        activeNavBar: 'users',
        backLink: {
          href: `/system/users/internal/setup/${session.id}/check`,
          text: 'Back'
        },
        email: session.email,
        pageTitle: 'You are about to cancel this user',
        pageTitleCaption: 'Internal',
        permission: 'Billing and Data'
      })
    })
  })
})
