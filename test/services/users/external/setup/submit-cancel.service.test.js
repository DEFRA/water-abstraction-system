'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const UserSessionsFixture = require('../../../../support/fixtures/user-sessions.fixture.js')
const SessionModelStub = require('../../../../support/stubs/session.stub.js')

// Things we need to stub
const DeleteSessionDal = require('../../../../../app/dal/delete-session.dal.js')
const FetchSessionDal = require('../../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitCancelService = require('../../../../../app/services/users/external/setup/submit-cancel.service.js')

describe('Users - External - Setup - Submit Cancel service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = UserSessionsFixture.unregistrationSession()
    sessionData.allLicences = true

    session = SessionModelStub.build(Sinon, sessionData)
    Sinon.stub(FetchSessionDal, 'go').resolves(session)

    Sinon.stub(DeleteSessionDal, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('clears the session', async () => {
      await SubmitCancelService(session.id)

      expect(DeleteSessionDal.go.calledWith(session.id)).toBe(true)
    })

    it('returns the redirect url', async () => {
      const result = await SubmitCancelService(session.id)

      expect(result).toEqual({
        redirectUrl: `/system/users/external/${session.user.id}/licences?back=${session.activeNavBar}`
      })
    })
  })
})
