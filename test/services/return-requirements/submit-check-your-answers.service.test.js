'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const SessionHelper = require('../../support/helpers/session.helper.js')
const ExpandedError = require('../../../app/errors/expanded.error.js')

// Thing under test
const SubmitCheckYourAnswersService = require('../../../app/services/return-requirements/submit-check-your-answers.service.js')

describe('Submit Check Your Answers service', () => {
  let session
  let sandbox
  let sessionId

  beforeEach(async () => {
    sandbox = Sinon.createSandbox()
    session = await SessionHelper.add({
      data: {
        licence: {
          id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d'
        }
      }
    })
    sessionId = session.id
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('When called with a valid licence', () => {
    it('returns a valid licence', async () => {
      const licenceId = session.data.licence.id

      Sinon.stub(SubmitCheckYourAnswersService, 'go').resolves({ data: { licence: { id: licenceId } } })

      const result = await SubmitCheckYourAnswersService.go(sessionId)
      expect(result.data.licence.id).to.equal(licenceId)
    })
  })

  describe('When called with an invalid (revoked, expired or lapsed) licence', () => {
    beforeEach(async () => {
      Sinon.stub(SubmitCheckYourAnswersService, 'go').rejects(new ExpandedError('Invalid return requirement'))
    })
    it('throws an error', async () => {
      const response = await expect(SubmitCheckYourAnswersService.go(sessionId)).to.reject()
      expect(response).to.be.an.instanceOf(ExpandedError)
      expect(response).to.contain('Invalid return requirement')
    })
  })
})
