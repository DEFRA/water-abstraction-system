'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const SessionModelStub = require('../../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../../app/dal/fetch-session.dal.js')

// Thing under test
const ViewAccessService = require('../../../../../app/services/users/internal/setup/view-access.service.js')

describe('Users - Internal - Setup - View Access Service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = { access: 'enabled' }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewAccessService(session.id)

      expect(result).toEqual({
        access: 'enabled',
        activeNavBar: 'users',
        backLink: {
          href: `/system/users/internal/setup/${session.id}/check`,
          text: 'Back'
        },
        pageTitle: 'Select access for the user',
        pageTitleCaption: 'Internal'
      })
    })
  })
})
