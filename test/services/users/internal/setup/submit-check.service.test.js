'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModelStub = require('../../../../support/stubs/session.stub.js')

// Things we need to stub
const CreateUserDal = require('../../../../../app/dal/users/internal/create-user.dal.js')
const DeleteSessionDal = require('../../../../../app/dal/delete-session.dal.js')
const FetchSessionDal = require('../../../../../app/dal/fetch-session.dal.js')
const InsertNotificationDal = require('../../../../../app/dal/users/internal/insert-notification.dal.js')
const SendVerificationEmailService = require('../../../../../app/services/users/internal/setup/send-verification-email.service.js')

// Thing under test
const SubmitCheckService = require('../../../../../app/services/users/internal/setup/submit-check.service.js')

describe('Users - Internal - Setup - Submit Check Service', () => {
  const notification = {
    id: '06a30477-fbdc-4e62-8f1a-1b6f9b83a454',
    messageRef: 'new_internal_user_email',
    messageType: 'email',
    personalisation: {
      unique_create_password_link:
        'https://internal.com/reset_password_change_password?resetGuid=4695078b-1f09-4cb9-80ab-15528d2718d4'
    },
    recipient: 'new-user@wrls.gov.uk'
  }
  const resetGuid = '8f5123e3-a982-40c1-843c-b6ef09b1c6bd'

  let auth
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    auth = { credentials: { user: { id: 1 } } }

    sessionData = {
      email: 'bob.bobbles@environment-agency.gov.uk',
      permission: 'billing_and_data'
    }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(CreateUserDal, 'go').resolves(resetGuid)
    Sinon.stub(DeleteSessionDal, 'go').resolves()
    Sinon.stub(FetchSessionDal, 'go').resolves(session)
    Sinon.stub(InsertNotificationDal, 'go').resolves(notification)
    Sinon.stub(SendVerificationEmailService, 'go').resolves()

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('deletes the session record', async () => {
      await SubmitCheckService.go(auth, session.id, yarStub)

      expect(DeleteSessionDal.go.calledWith(session.id)).to.be.true()
    })

    it('calls the CreateUserDal with the auth and session', async () => {
      await SubmitCheckService.go(auth, session.id, yarStub)

      expect(CreateUserDal.go.calledWith(auth, session)).to.be.true()
    })

    it('calls the InsertNotificationDal with the email and resetGuid', async () => {
      await SubmitCheckService.go(auth, session.id, yarStub)

      expect(InsertNotificationDal.go.calledWith(session.email, resetGuid)).to.be.true()
    })

    it('sets a success flash notification', async () => {
      await SubmitCheckService.go(auth, session.id, yarStub)

      const [flashType, notificationData] = yarStub.flash.args[0]

      expect(flashType).to.equal('notification')
      expect(notificationData).to.equal({
        titleText: 'User added',
        text: `We have emailed ${session.email} instructions to complete their account set up.`
      })
    })

    it('calls the SendVerificationEmailService with the notification', async () => {
      await SubmitCheckService.go(auth, session.id, yarStub)

      expect(SendVerificationEmailService.go.calledWith(notification)).to.be.true()
    })
  })
})
