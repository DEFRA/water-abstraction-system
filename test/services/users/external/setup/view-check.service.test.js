'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const SessionModelStub = require('../../../../support/stubs/session.stub.js')
const UserSessionsFixture = require('../../../../support/fixtures/user-sessions.fixture.js')
const YarStub = require('../../../../support/stubs/yar.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../../app/dal/fetch-session.dal.js')

// Thing under test
const ViewCheckService = require('../../../../../app/services/users/external/setup/view-check.service.js')

describe('Users - External - Setup - View Check Service', () => {
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    sessionData = UserSessionsFixture.unregistrationSession()
    sessionData.allLicences = true

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)

    yarStub = YarStub.build(Sinon)
    yarStub.flash.returns([{ title: 'Updated', text: 'Licences unregistered.' }])
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewCheckService.go(session.id, yarStub)

      expect(result).toEqual({
        activeNavBar: 'users',
        licences: ['All licences'],
        links: {
          cancel: `/system/users/external/setup/${session.id}/cancel`,
          licences: `/system/users/external/setup/${session.id}/licences`
        },
        notification: {
          text: 'Licences unregistered.',
          title: 'Updated'
        },
        pageTitle: 'Check licences to unregister',
        pageTitleCaption: session.user.username,
        warning: {
          iconFallbackText: 'Warning',
          text: 'All these licences will no longer be accessible to existing users.'
        }
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

      it('displays the notification', async () => {
        const result = await ViewCheckService.go(session.id, yarStub)

        expect(result.notification).toEqual('Test notification')
      })
    })
  })
})
