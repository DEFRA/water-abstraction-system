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
const FetchLicenceService = require('../../../app/services/return-requirements/fetch-licence.service.js')
const SubmitCheckYourAnswersService = require('../../../app/services/return-requirements/submit-check-your-answers.service.js')

describe('Submit Check Your Answers service', () => {
  let session
  let sessionId
  let licenceId

  beforeEach(async () => {
    session = await SessionHelper.add({
      data: {
        licence: {
          id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d'
        }
      }
    })
    sessionId = session.id
    licenceId = session.data.licence.id
  })

  afterEach(() => {
    Sinon.restore()
  })
  describe('POST /return-requirements/{sessionDd}/check-your-answers', () => {
    Sinon.stub(FetchLicenceService, 'go').resolves({
      id: licenceId,
      ends: null
    })

    describe('When called with a valid licence', () => {
      it('returns a valid licence', async () => {
        Sinon.stub(SubmitCheckYourAnswersService, 'go').resolves({ data: { licence: { id: licenceId } } })

        const result = await SubmitCheckYourAnswersService.go(sessionId)
        expect(result.data.licence.id).to.equal(licenceId)
      })
    })
    describe('when the licence expired date is null', () => {
      it('returns licence expired date is null', async () => {
        const result = await SubmitCheckYourAnswersService.go(sessionId)

        expect(result.ends).to.be.null()
      })
    })

    describe('when the licence does have an end date but it is in the future (expired, lapsed or revoked)', () => {
      beforeEach(() => {
        session.data.licence.expiredDate = new Date('2099-04-01')
      })

      it('returns null', async () => {
        const result = await SubmitCheckYourAnswersService.go(sessionId)

        expect(result.ends).to.be.null()
      })
    })

    describe('When called with an invalid licence (expired, lapsed or revoked)', () => {
      beforeEach(async () => {
        Sinon.stub(SubmitCheckYourAnswersService, 'go').rejects(new ExpandedError('Invalid return requirement', {}))
      })
      it('throws an error', async () => {
        const response = await expect(SubmitCheckYourAnswersService.go(sessionId)).to.reject()
        expect(response).to.be.an.instanceOf(ExpandedError)
        expect(response.message).to.equal('Invalid return requirement')
      })
    })
  })
})
