'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const SessionModelStub = require('../../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../../app/dal/fetch-session.dal.js')

// Thing under test
const ViewEmailService = require('../../../../../app/services/users/internal/setup/view-email.service.js')

describe('Users - Internal - Setup - View Email Service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {}

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewEmailService.go(session.id)

      expect(result).toEqual({
        activeNavBar: 'users',
        backLink: {
          href: '/system/users',
          text: 'Back'
        },
        email: null,
        pageTitle: 'Enter an email address for the user',
        pageTitleCaption: 'Internal'
      })
    })
  })
})
