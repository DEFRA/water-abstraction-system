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

// Thing under test
const SubmitCheckService = require('../../../../../app/services/users/internal/setup/submit-check.service.js')

describe('Users - Internal - Setup - Submit Check Service', () => {
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    sessionData = {
      email: 'bob.bobbles@environment-agency.gov.uk',
      permissions: 'billing_and_data'
    }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(CreateUserDal, 'go').resolves()
    Sinon.stub(DeleteSessionDal, 'go').resolves()
    Sinon.stub(FetchSessionDal, 'go').resolves(session)

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('and the user is created successfully', () => {
      it('calls the CreateUserDal with the session', async () => {
        await SubmitCheckService.go(session.id, yarStub)

        expect(CreateUserDal.go.calledWith(session)).to.be.true()
      })

      it('sets a success notification', async () => {
        await SubmitCheckService.go(session.id, yarStub)

        const [flashType, notificationData] = yarStub.flash.args[0]

        expect(flashType).to.equal('notification')
        expect(notificationData).to.equal({
          titleText: `User "${session.email}" added`,
          text: 'We have emailed the new user instructions to complete their account set up.'
        })
      })

      it('deletes the session record', async () => {
        await SubmitCheckService.go(session.id, yarStub)

        expect(DeleteSessionDal.go.calledWith(session.id)).to.be.true()
      })
    })

    describe('and the user creation fails', () => {
      beforeEach(() => {
        CreateUserDal.go.rejects(new Error('Database error'))
      })

      it('sets an error notification', async () => {
        await SubmitCheckService.go(session.id, yarStub)

        const [flashType, notificationData] = yarStub.flash.args[0]

        expect(flashType).to.equal('notification')
        expect(notificationData).to.equal({
          titleText: `User "${session.email}" not added`,
          text: 'There was a problem adding the user. Please try again.'
        })
      })
    })
  })
})
