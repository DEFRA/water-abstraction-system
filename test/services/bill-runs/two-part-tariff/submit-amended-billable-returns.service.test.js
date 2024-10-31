'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = Code

// Test helpers
const ReviewChargeElementHelper = require('../../../support/helpers/review-charge-element.helper.js')
const ReviewChargeElementModel = require('../../../../app/models/review-charge-element.model.js')

// Things we need to stub
const FetchMatchDetailsService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-match-details.service.js')
const AmendBillableReturnsPresenter = require('../../../../app/presenters/bill-runs/two-part-tariff/amend-billable-returns.presenter.js')

// Thing under test
const SubmitAmendedBillableReturnsService = require('../../../../app/services/bill-runs/two-part-tariff/submit-amended-billable-returns.service.js')

describe('Submit Amended Billable Returns Service', () => {
  const billRunId = 'cc4bbb18-0d6a-4254-ac2c-7409de814d7e'
  const licenceId = '9a8a148d-b71e-463c-bea8-bc5e0a5d95e2'
  let payload
  let reviewChargeElement
  let yarStub

  beforeEach(async () => {
    yarStub = { flash: Sinon.stub() }

    reviewChargeElement = await ReviewChargeElementHelper.add()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload for quantityOptions', () => {
      beforeEach(async () => {
        payload = {
          'quantity-options': 10,
          authorisedVolume: 11
        }
      })

      it('saves the submitted option', async () => {
        await SubmitAmendedBillableReturnsService.go(billRunId, licenceId, reviewChargeElement.id, payload, yarStub)

        const reviewChargeElementData = await _fetchReviewChargeElement(reviewChargeElement.id)

        expect(reviewChargeElementData.amendedAllocated).to.equal(10)
      })

      it('sets the banner message to "The billable returns for this licence have been updated"', async () => {
        await SubmitAmendedBillableReturnsService.go(billRunId, licenceId, reviewChargeElement.id, payload, yarStub)

        const [flashType, bannerMessage] = yarStub.flash.args[0]

        expect(flashType).to.equal('banner')
        expect(bannerMessage).to.equal('The billable returns for this licence have been updated')
      })
    })

    describe('with a valid payload for customQuantity', () => {
      beforeEach(async () => {
        payload = {
          'quantity-options': 'customQuantity',
          customQuantity: 20,
          authorisedVolume: 25
        }
      })

      it('saves the submitted value', async () => {
        await SubmitAmendedBillableReturnsService.go(billRunId, licenceId, reviewChargeElement.id, payload, yarStub)

        const reviewChargeElementData = await _fetchReviewChargeElement(reviewChargeElement.id)

        expect(reviewChargeElementData.amendedAllocated).to.equal(20)
      })

      it('sets the banner message to "The billable returns for this licence have been updated"', async () => {
        await SubmitAmendedBillableReturnsService.go(billRunId, licenceId, reviewChargeElement.id, payload, yarStub)

        const [flashType, bannerMessage] = yarStub.flash.args[0]

        expect(flashType).to.equal('banner')
        expect(bannerMessage).to.equal('The billable returns for this licence have been updated')
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        Sinon.stub(FetchMatchDetailsService, 'go').resolves({ billRun: 'bill run', reviewChargeElement: 'charge element' })
        Sinon.stub(AmendBillableReturnsPresenter, 'go').returns(_amendBillableReturnsData())
      })
      describe('because the user did not select anything', () => {
        beforeEach(async () => {
          payload = {
            authorisedVolume: 11
          }
        })

        it('returns the page data for the view', async () => {
          const result = await SubmitAmendedBillableReturnsService.go(
            billRunId,
            licenceId,
            reviewChargeElement.id,
            payload,
            yarStub
          )

          expect(result).to.equal({
            activeNavBar: 'search',
            pageTitle: 'Set the billable returns quantity for this bill run',
            chargeElement: {
              description: 'Trickle Irrigation - Direct',
              dates: ['1 April 2022 to 5 June 2022'],
              authorisedQuantity: 200,
              reviewChargeElementId: 'b4d70c89-de1b-4f68-a47f-832b338ac044'
            },
            billRun: {
              id: '6620135b-0ecf-4fd4-924e-371f950c0526',
              financialYear: '2022 to 2023'
            },
            chargeVersion: {
              chargePeriod: '1 April 2022 to 5 June 2022'
            },
            licenceId: '5aa8e752-1a5c-4b01-9112-d92a543b70d1',
            customQuantitySelected: false,
            customQuantityValue: undefined
          }, { skip: ['error'] })
        })

        it('returns page data with an error for the radio form element', async () => {
          const result = await SubmitAmendedBillableReturnsService.go(
            billRunId,
            licenceId,
            reviewChargeElement.id,
            payload,
            yarStub
          )

          expect(result.error).to.equal({
            message: 'Select the billable quantity',
            radioFormElement: { text: 'Select the billable quantity' },
            customQuantityInputFormElement: null
          })
        })
      })

      describe('because the user entered an invalid value', () => {
        beforeEach(async () => {
          payload = {
            'quantity-options': 'customQuantity',
            customQuantity: 'Hello world',
            authorisedVolume: 11
          }
        })

        it('returns the page data for the view', async () => {
          const result = await SubmitAmendedBillableReturnsService.go(
            billRunId,
            licenceId,
            reviewChargeElement.id,
            payload,
            yarStub
          )

          expect(result).to.equal({
            activeNavBar: 'search',
            pageTitle: 'Set the billable returns quantity for this bill run',
            chargeElement: {
              description: 'Trickle Irrigation - Direct',
              dates: ['1 April 2022 to 5 June 2022'],
              authorisedQuantity: 200,
              reviewChargeElementId: 'b4d70c89-de1b-4f68-a47f-832b338ac044'
            },
            billRun: {
              id: '6620135b-0ecf-4fd4-924e-371f950c0526',
              financialYear: '2022 to 2023'
            },
            chargeVersion: {
              chargePeriod: '1 April 2022 to 5 June 2022'
            },
            licenceId: '5aa8e752-1a5c-4b01-9112-d92a543b70d1',
            customQuantitySelected: true,
            customQuantityValue: 'Hello world'
          }, { skip: ['error'] })
        })

        it('returns page data with an error for the custom quantity input form element', async () => {
          const result = await SubmitAmendedBillableReturnsService.go(
            billRunId,
            licenceId,
            reviewChargeElement.id,
            payload,
            yarStub
          )

          expect(result.error).to.equal({
            message: 'The quantity must be a number',
            radioFormElement: null,
            customQuantityInputFormElement: { text: 'The quantity must be a number' }
          })
        })
      })
    })
  })
})

function _amendBillableReturnsData () {
  return {
    chargeElement: {
      description: 'Trickle Irrigation - Direct',
      dates: ['1 April 2022 to 5 June 2022'],
      authorisedQuantity: 200,
      reviewChargeElementId: 'b4d70c89-de1b-4f68-a47f-832b338ac044'
    },
    billRun: {
      id: '6620135b-0ecf-4fd4-924e-371f950c0526',
      financialYear: '2022 to 2023'
    },
    chargeVersion: {
      chargePeriod: '1 April 2022 to 5 June 2022'
    },
    licenceId: '5aa8e752-1a5c-4b01-9112-d92a543b70d1'
  }
}

async function _fetchReviewChargeElement (id) {
  return ReviewChargeElementModel.query()
    .findById(id)
}
