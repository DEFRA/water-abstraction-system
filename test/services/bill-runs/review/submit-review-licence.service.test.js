'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Test helpers
const BillRunsReviewFixture = require('../../../fixtures/bill-runs-review.fixture.js')
const ReviewLicenceModel = require('../../../../app/models/review-licence.model.js')

// Things we need to stub
const FetchReviewLicenceService = require('../../../../app/services/bill-runs/review/fetch-review-licence.service.js')

// Thing under test
const SubmitReviewLicenceService = require('../../../../app/services/bill-runs/review/submit-review-licence.service.js')

describe('Bill Runs Review - Submit Review Licence Service', () => {
  let payload
  let patchStub
  let reviewLicence
  let yarStub

  beforeEach(async () => {
    reviewLicence = BillRunsReviewFixture.reviewLicence()

    Sinon.stub(FetchReviewLicenceService, 'go').resolves(reviewLicence)

    patchStub = Sinon.stub().resolves()
    Sinon.stub(ReviewLicenceModel, 'query').returns({
      findById: Sinon.stub().withArgs(reviewLicence.id).returnsThis(),
      patch: patchStub
    })

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('and the user is updating the status', () => {
      beforeEach(() => {
        payload = { 'licence-status': 'ready' }
      })

      it('sets a flash message and updates the status of the review licence', async () => {
        await SubmitReviewLicenceService.go(reviewLicence.id, yarStub, payload)

        // Check we save the status change
        const [patchObject] = patchStub.args[0]

        expect(patchObject).to.equal({ status: 'ready' })

        // Check we add the flash message
        const [flashType, bannerMessage] = yarStub.flash.args[0]

        expect(flashType).to.equal('banner')
        expect(bannerMessage).to.equal('Licence changed to ready.')
      })
    })

    describe('and the user is updating the progress', () => {
      describe('to mark it as "in progress"', () => {
        beforeEach(() => {
          payload = { 'mark-progress': 'mark' }
        })

        it('sets a flash message and updates the progress of the review licence', async () => {
          await SubmitReviewLicenceService.go(reviewLicence.id, yarStub, payload)

          // Check we save the status change
          const [patchObject] = patchStub.args[0]

          expect(patchObject).to.equal({ progress: true })

          // Check we add the flash message
          const [flashType, bannerMessage] = yarStub.flash.args[0]

          expect(flashType).to.equal('banner')
          expect(bannerMessage).to.equal('This licence has been marked.')
        })
      })

      describe('to unmark it', () => {
        beforeEach(() => {
          payload = { 'mark-progress': 'unmark' }
        })

        it('sets a flash message and updates the progress of the review licence', async () => {
          await SubmitReviewLicenceService.go(reviewLicence.id, yarStub, payload)

          // Check we save the status change
          const [patchObject] = patchStub.args[0]

          expect(patchObject).to.equal({ progress: false })

          // Check we add the flash message
          const [flashType, bannerMessage] = yarStub.flash.args[0]

          expect(flashType).to.equal('banner')
          expect(bannerMessage).to.equal('The progress mark for this licence has been removed.')
        })
      })
    })
  })
})
