'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

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
      await SubmitCancelService.go(session.id)

      expect(DeleteSessionDal.go.calledWith(session.id)).to.be.true()
    })

    it('returns the redirect url', async () => {
      const result = await SubmitCancelService.go(session.id)

      expect(result).to.equal({
        redirectUrl: `/system/users/external/${session.user.id}/licences?back=${session.activeNavBar}`
      })
    })
  })
})
