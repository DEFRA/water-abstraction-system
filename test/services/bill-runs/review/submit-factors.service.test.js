'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillRunsReviewFixture = require('../../../fixtures/bill-runs-review.fixture.js')

// Things we need to stub
const FetchReviewChargeReferenceService = require('../../../../app/services/bill-runs/review/fetch-review-charge-reference.service.js')
const ReviewChargeReferenceModel = require('../../../../app/models/review-charge-reference.model.js')

// Thing under test
const SubmitFactorsService = require('../../../../app/services/bill-runs/review/submit-factors.service.js')

describe('Bill Runs Review - Submit Factors Service', () => {
  let payload
  let patchStub
  let reviewChargeReference
  let yarStub

  beforeEach(() => {
    reviewChargeReference = BillRunsReviewFixture.reviewChargeReference()

    Sinon.stub(FetchReviewChargeReferenceService, 'go').resolves(reviewChargeReference)

    patchStub = Sinon.stub().resolves()
    Sinon.stub(ReviewChargeReferenceModel, 'query').returns({
      findById: Sinon.stub().withArgs(reviewChargeReference.id).returnsThis(),
      patch: patchStub
    })

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(async () => {
        payload = { amendedAggregate: 0.5, amendedChargeAdjustment: 0.5 }
      })

      it('saves the submitted value, adds a flash message and returns an empty object', async () => {
        const result = await SubmitFactorsService.go(reviewChargeReference.id, yarStub, payload)

        // Check we save the change
        const [patchObject] = patchStub.args[0]

        expect(patchObject).to.equal({ amendedAggregate: 0.5, amendedChargeAdjustment: 0.5 })

        // Check we add the flash message
        const [flashType, bannerMessage] = yarStub.flash.args[0]

        expect(flashType).to.equal('banner')
        expect(bannerMessage).to.equal('The adjustment factors for this licence have been updated')

        // Check we return an empty object (controller knows POST was successful so redirects)
        expect(result).to.equal({})
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(async () => {
        payload = {}
      })

      it('does not save the submitted value or add a flash message, and returns the page data including an error', async () => {
        const result = await SubmitFactorsService.go(reviewChargeReference.id, yarStub, payload)

        // Check we didn't save
        expect(patchStub.called).to.be.false()

        // Check we didn't add the flash message
        expect(yarStub.flash.called).to.be.false()

        // Check we return page data including error (controller knows POST failed so re-renders)
        expect(result).to.equal({
          activeNavBar: 'bill-runs',
          amendedAggregate: 0.333333333,
          amendedChargeAdjustment: 1,
          error: {
            errorList: [
              { href: '#amended-aggregate', text: 'Enter an aggregate factor' },
              { href: '#amended-charge-adjustment', text: 'Enter a charge factor' }
            ],
            amendedAggregate: { message: 'Enter an aggregate factor' },
            amendedChargeAdjustment: { message: 'Enter a charge factor' }
          },
          pageTitle: 'Set the adjustment factors',
          chargeDescription: 'High loss, non-tidal, restricted water, up to and including 15 ML/yr, Tier 1 model',
          chargePeriod: '1 April 2023 to 31 March 2024',
          financialPeriod: '2023 to 2024',
          otherAdjustments: ['Two part tariff agreement'],
          reviewChargeReferenceId: '6b3d11f2-d361-4eaa-bce2-5561283bd023'
        })
      })
    })
  })
})
