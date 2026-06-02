'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModelStub = require('../../../../support/stubs/session.stub.js')
const YarStub = require('../../../../support/stubs/yar.stub.js')
const { generateUUID } = require('../../../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../../../support/helpers/licence.helper.js')

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

    sessionData = {
      activeNavBar: 'users',
      allLicences: true,
      id: generateUUID(),
      licences: [
        {
          id: generateUUID(),
          licenceRef: generateLicenceRef(),
          licenceVersions: [
            {
              id: generateUUID(),
              issueDate: null,
              licenceId: generateUUID(),
              startDate: new Date('2022-04-01'),
              status: 'current',
              company: {
                id: generateUUID(),
                name: 'ACME Farms Ltd',
                type: 'organisation'
              }
            }
          ]
        }
      ],
      selectedLicences: [],
      user: {
        id: generateUUID(),
        licenceEntityId: generateUUID(),
        username: 'jon.lee@example.co.uk'
      }
    }

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

      expect(DeleteSessionDal.go.calledWith(session.id)).to.be.true()
    })

    it('returns the redirect URL', async () => {
      const result = await SubmitCheckService.go(session.id, yarStub, auth)

      expect(result).to.equal({
        redirectUrl: `/system/users/external/${session.user.id}/licences?back=${session.activeNavBar}`
      })
    })

    it('unregisters the selected licences', async () => {
      await SubmitCheckService.go(session.id, yarStub, auth)

      expect(UnregisterLicencesDal.go.calledWith(session, auth.credentials.user)).to.be.true()
    })

    it('sets a notification', async () => {
      await SubmitCheckService.go(session.id, yarStub, auth)

      const [flashType, notificationData] = yarStub.flash.args[0]

      expect(flashType).to.equal('notification')
      expect(notificationData).to.equal({
        titleText: 'Updated',
        text: 'Licences unlinked.'
      })
    })
  })
})
