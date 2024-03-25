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
const CheckLicenceEndedService = require('../../../app/services/return-requirements/check-licence-ended.service.js')
const SubmitCheckYourAnswersService = require('../../../app/services/return-requirements/submit-check-your-answers.service.js')

describe('Submit Check Your Answers service', () => {
  let session
  let sessionId

  beforeEach(async () => {
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
    Sinon.restore()
  })

  describe('When called with a valid licence', () => {
    beforeEach(() => {
      Sinon.stub(CheckLicenceEndedService, 'go').resolves(false)
    })

    it('returns a valid licence', async () => {
      const result = await SubmitCheckYourAnswersService.go(sessionId)
      expect(result).to.equal(session.data.licence.id)
    })
  })

  describe('When called with an invalid licence (expired, lapsed or revoked)', () => {
    beforeEach(async () => {
      Sinon.stub(CheckLicenceEndedService, 'go').resolves(true)
    })

    it('throws an error', async () => {
      const response = await expect(SubmitCheckYourAnswersService.go(sessionId)).to.reject()
      expect(response).to.be.an.instanceOf(ExpandedError)
      expect(response.message).to.equal('Invalid licence for return requirements')
    })
  })
})
