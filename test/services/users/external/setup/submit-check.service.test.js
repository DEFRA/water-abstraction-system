'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const SessionModelStub = require('../../../../support/stubs/session.stub.js')
const UserSessionsFixture = require('../../../../support/fixtures/user-sessions.fixture.js')
const YarStub = require('../../../../support/stubs/yar.stub.js')
const { generateUUID } = require('../../../../../app/lib/general.lib.js')

// Things we need to stub
const DeleteSessionDal = require('../../../../../app/dal/delete-session.dal.js')
const FetchSessionDal = require('../../../../../app/dal/fetch-session.dal.js')
const UnregisterLicencesDal = require('../../../../../app/dal/users/external/setup/unregister-licences.dal.js')

// Thing under test
const SubmitCheckService = require('../../../../../app/services/users/external/setup/submit-check.service.js')

describe('Users - External - Setup - Submit Check Service', () => {
  let auth
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    auth = { credentials: { user: { id: generateUUID() } } }

    sessionData = UserSessionsFixture.unregistrationSession()
    sessionData.allLicences = true

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(DeleteSessionDal, 'go').resolves()
    Sinon.stub(FetchSessionDal, 'go').resolves(session)
    Sinon.stub(UnregisterLicencesDal, 'go').resolves()

    yarStub = YarStub.build(Sinon)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('deletes the session record', async () => {
      await SubmitCheckService.go(session.id, yarStub, auth)

      expect(DeleteSessionDal.go.calledWith(session.id)).toBe(true)
    })

    it('returns the redirect URL', async () => {
      const result = await SubmitCheckService.go(session.id, yarStub, auth)

      expect(result).toEqual({
        redirectUrl: `/system/users/external/${session.user.id}/licences?back=${session.activeNavBar}`
      })
    })

    it('unregisters the selected licences', async () => {
      await SubmitCheckService.go(session.id, yarStub, auth)

      expect(UnregisterLicencesDal.go.calledWith(session, auth.credentials.user)).toBe(true)
    })

    it('sets a notification', async () => {
      await SubmitCheckService.go(session.id, yarStub, auth)

      const [flashType, notificationData] = yarStub.flash.args[0]

      expect(flashType).toEqual('notification')
      expect(notificationData).toEqual({
        titleText: 'Updated',
        text: 'Licences unregistered.'
      })
    })
  })
})
