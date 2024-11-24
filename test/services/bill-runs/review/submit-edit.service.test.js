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
const FetchReviewChargeElementService = require('../../../../app/services/bill-runs/review/fetch-review-charge-element.service.js')
const ReviewChargeElementModel = require('../../../../app/models/review-charge-element.model.js')

// Thing under test
const SubmitEditService = require('../../../../app/services/bill-runs/review/submit-edit.service.js')

describe('Bill Runs Review - Submit Edit Service', () => {
  const elementIndex = 1

  let payload
  let patchStub
  let reviewChargeElement
  let yarStub

  beforeEach(() => {
    reviewChargeElement = BillRunsReviewFixture.reviewChargeElement()

    Sinon.stub(FetchReviewChargeElementService, 'go').resolves(reviewChargeElement)

    patchStub = Sinon.stub().resolves()
    Sinon.stub(ReviewChargeElementModel, 'query').returns({
      findById: Sinon.stub().withArgs(reviewChargeElement.id).returnsThis(),
      patch: patchStub
    })

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      describe('where the user has selected the authorised quantity', () => {
        beforeEach(async () => {
          payload = { quantityOptions: 25, authorisedVolume: 30 }
        })

        it('saves the submitted value, adds a flash message and returns an empty object', async () => {
          const result = await SubmitEditService.go(reviewChargeElement.id, elementIndex, yarStub, payload)

          // Check we save the change
          const [patchObject] = patchStub.args[0]

          expect(patchObject).to.equal({ amendedAllocated: 25 })

          // Check we add the flash message
          const [flashType, bannerMessage] = yarStub.flash.args[0]

          expect(flashType).to.equal('banner')
          expect(bannerMessage).to.equal('The billable returns for this licence have been updated')

          // Check we return an empty object (controller knows POST was successful so redirects)
          expect(result).to.equal({})
        })
      })

      describe('where the user has a custom quantity', () => {
        beforeEach(async () => {
          payload = { quantityOptions: 'customQuantity', customQuantity: 12, authorisedVolume: 30 }
        })

        it('saves the submitted value, adds a flash message and returns an empty object', async () => {
          const result = await SubmitEditService.go(reviewChargeElement.id, elementIndex, yarStub, payload)

          // Check we save the change
          const [patchObject] = patchStub.args[0]

          expect(patchObject).to.equal({ amendedAllocated: 12 })

          // Check we add the flash message
          const [flashType, bannerMessage] = yarStub.flash.args[0]

          expect(flashType).to.equal('banner')
          expect(bannerMessage).to.equal('The billable returns for this licence have been updated')

          // Check we return an empty object (controller knows POST was successful so redirects)
          expect(result).to.equal({})
        })
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user did not select an option', () => {
        beforeEach(async () => {
          payload = { authorisedVolume: 30 }
        })

        it('does not save the submitted value or add a flash message, and returns the page data including an error', async () => {
          const result = await SubmitEditService.go(reviewChargeElement.id, elementIndex, yarStub, payload)

          // Check we didn't save
          expect(patchStub.called).to.be.false()

          // Check we didn't add the flash message
          expect(yarStub.flash.called).to.be.false()

          // Check we return page data including error (controller knows POST failed so re-renders)
          expect(result).to.equal({
            customQuantitySelected: false,
            customQuantityValue: undefined,
            error: {
              errorList: [
                {
                  href: '#quantityOptions-error',
                  text: 'Select the billable quantity'
                }
              ],
              quantityOptionsErrorMessage: { text: 'Select the billable quantity' }
            },
            pageTitle: 'Set the billable returns quantity for this bill run',
            authorisedQuantity: 9.092,
            billableReturns: 0,
            chargeDescription: 'Spray Irrigation - Direct',
            chargePeriod: '1 April 2023 to 31 March 2024',
            chargePeriods: ['1 April 2023 to 30 September 2023'],
            elementIndex: 1,
            financialPeriod: '2023 to 2024',
            reviewChargeElementId: 'a1840523-a04c-4c64-bff7-4a515e8ba1c1'
          })
        })
      })

      describe('because the submitted an invalid custom quantity', () => {
        beforeEach(async () => {
          payload = { quantityOptions: 'customQuantity', customQuantity: -0.1, authorisedVolume: 25 }
        })

        it('does not save the submitted value or add a flash message, and returns the page data including an error', async () => {
          const result = await SubmitEditService.go(reviewChargeElement.id, elementIndex, yarStub, payload)

          // Check we didn't save
          expect(patchStub.called).to.be.false()

          // Check we didn't add the flash message
          expect(yarStub.flash.called).to.be.false()

          // Check we return page data including error (controller knows POST failed so re-renders)
          expect(result).to.equal({
            customQuantitySelected: true,
            customQuantityValue: -0.1,
            error: {
              errorList: [
                {
                  href: '#custom-quantity',
                  text: 'The quantity must be zero or higher'
                }
              ],
              customQuantityErrorMessage: { text: 'The quantity must be zero or higher' }
            },
            pageTitle: 'Set the billable returns quantity for this bill run',
            authorisedQuantity: 9.092,
            billableReturns: 0,
            chargeDescription: 'Spray Irrigation - Direct',
            chargePeriod: '1 April 2023 to 31 March 2024',
            chargePeriods: ['1 April 2023 to 30 September 2023'],
            elementIndex: 1,
            financialPeriod: '2023 to 2024',
            reviewChargeElementId: 'a1840523-a04c-4c64-bff7-4a515e8ba1c1'
          })
        })
      })
    })
  })
})
