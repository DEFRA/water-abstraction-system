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
const DeleteSessionDal = require('../../../../../app/dal/delete-session.dal.js')

// Thing under test
const SubmitCancelService = require('../../../../../app/services/users/internal/setup/submit-cancel.service.js')

describe('Users - Internal - Setup - Submit Cancel service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      email: 'bob.bobbles@environment-agency.gov.uk',
      permission: 'billing_and_data'
    }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(DeleteSessionDal, 'go').resolves(session)
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
        redirectUrl: '/system/users'
      })
    })
  })
})
