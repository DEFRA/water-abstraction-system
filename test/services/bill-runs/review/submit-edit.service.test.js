// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import YarStub from 'water-abstraction-engine/test/stubs/yar.stub.js'
import BillRunsReviewFixture from '../../../support/fixtures/bill-runs-review.fixture.js'

// Things we need to stub
import ReviewChargeElementModel from 'water-abstraction-engine/models/review-charge-element.model.js'
import * as FetchReviewChargeElementService from '../../../../src/services/bill-runs/review/fetch-review-charge-element.service.js'

// Thing under test
import SubmitEditService from '../../../../src/services/bill-runs/review/submit-edit.service.js'

describe('Bill Runs Review - Submit Edit Service', () => {
  const elementIndex = 1

  let payload
  let patchStub
  let reviewChargeElement
  let yarStub

  beforeEach(() => {
    reviewChargeElement = BillRunsReviewFixture.reviewChargeElement()

    vi.spyOn(FetchReviewChargeElementService, 'default').mockResolvedValue(reviewChargeElement)

    patchStub = vi.fn().mockResolvedValue()
    vi.spyOn(ReviewChargeElementModel, 'query').mockReturnValue({
      findById: vi.fn().mockReturnThis(),
      patch: patchStub
    })

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      describe('where the user has selected the authorised quantity', () => {
        beforeEach(async () => {
          payload = { authorisedVolume: 30, quantityOptions: 25 }
        })

        it('saves the submitted value, adds a flash message and returns an empty object', async () => {
          const result = await SubmitEditService(reviewChargeElement.id, elementIndex, yarStub, payload)

          // Check we save the change
          const [patchObject] = patchStub.mock.calls[0]

          expect(patchObject).toEqual({ amendedAllocated: 25 })

          // Check we add the flash message
          const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

          expect(flashType).toEqual('banner')
          expect(bannerMessage).toEqual('The billable returns for this licence have been updated')

          // Check we return an empty object (controller knows POST was successful so redirects)
          expect(result).toEqual({})
        })
      })

      describe('where the user has a custom quantity', () => {
        beforeEach(async () => {
          payload = { authorisedVolume: 30, customQuantity: 12, quantityOptions: 'customQuantity' }
        })

        it('saves the submitted value, adds a flash message and returns an empty object', async () => {
          const result = await SubmitEditService(reviewChargeElement.id, elementIndex, yarStub, payload)

          // Check we save the change
          const [patchObject] = patchStub.mock.calls[0]

          expect(patchObject).toEqual({ amendedAllocated: 12 })

          // Check we add the flash message
          const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

          expect(flashType).toEqual('banner')
          expect(bannerMessage).toEqual('The billable returns for this licence have been updated')

          // Check we return an empty object (controller knows POST was successful so redirects)
          expect(result).toEqual({})
        })
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user did not select an option', () => {
        beforeEach(async () => {
          payload = { authorisedVolume: 30 }
        })

        it('does not save the submitted value or add a flash message, and returns the page data including an error', async () => {
          const result = await SubmitEditService(reviewChargeElement.id, elementIndex, yarStub, payload)

          // Check we didn't save
          expect(patchStub).not.toHaveBeenCalled()

          // Check we didn't add the flash message
          expect(yarStub.flash).not.toHaveBeenCalled()

          // Check we return page data including error (controller knows POST failed so re-renders)
          expect(result).toEqual({
            activeNavBar: 'bill-runs',
            authorisedQuantity: 9.092,
            billableReturns: 0,
            chargeDescription: 'Spray Irrigation - Direct',
            chargePeriod: '1 April 2023 to 31 March 2024',
            chargePeriods: ['1 April 2023 to 30 September 2023'],
            customQuantitySelected: false,
            customQuantityValue: undefined,
            elementIndex: 1,
            error: {
              errorList: [
                {
                  href: '#quantityOptions-error',
                  text: 'Select the billable quantity'
                }
              ],
              quantityOptionsErrorMessage: { text: 'Select the billable quantity' }
            },
            financialPeriod: '2023 to 2024',
            pageTitle: 'Set the billable returns quantity for this bill run',
            reviewChargeElementId: 'a1840523-a04c-4c64-bff7-4a515e8ba1c1'
          })
        })
      })

      describe('because the submitted an invalid custom quantity', () => {
        beforeEach(async () => {
          payload = { authorisedVolume: 25, customQuantity: -0.1, quantityOptions: 'customQuantity' }
        })

        it('does not save the submitted value or add a flash message, and returns the page data including an error', async () => {
          const result = await SubmitEditService(reviewChargeElement.id, elementIndex, yarStub, payload)

          // Check we didn't save
          expect(patchStub).not.toHaveBeenCalled()

          // Check we didn't add the flash message
          expect(yarStub.flash).not.toHaveBeenCalled()

          // Check we return page data including error (controller knows POST failed so re-renders)
          expect(result).toEqual({
            activeNavBar: 'bill-runs',
            authorisedQuantity: 9.092,
            billableReturns: 0,
            chargeDescription: 'Spray Irrigation - Direct',
            chargePeriod: '1 April 2023 to 31 March 2024',
            chargePeriods: ['1 April 2023 to 30 September 2023'],
            customQuantitySelected: true,
            customQuantityValue: -0.1,
            elementIndex: 1,
            error: {
              customQuantityErrorMessage: { text: 'The quantity must be zero or higher' },
              errorList: [
                {
                  href: '#custom-quantity',
                  text: 'The quantity must be zero or higher'
                }
              ]
            },
            financialPeriod: '2023 to 2024',
            pageTitle: 'Set the billable returns quantity for this bill run',
            reviewChargeElementId: 'a1840523-a04c-4c64-bff7-4a515e8ba1c1'
          })
        })
      })
    })
  })
})
