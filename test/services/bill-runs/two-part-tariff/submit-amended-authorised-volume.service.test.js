'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const AmendAuthorisedVolumePresenter = require('../../../../app/presenters/bill-runs/two-part-tariff/amend-authorised-volume.presenter.js')
const FetchAuthorisedVolumeService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-authorised-volume.service.js')
const ReviewChargeReferenceHelper = require('../../../support/helpers/review-charge-reference.helper.js')
const ReviewChargeReferenceModel = require('../../../../app/models/review-charge-reference.model.js')

// Thing under test
const SubmitAmendedAuthorisedVolumeService = require('../../../../app/services/bill-runs/two-part-tariff/submit-amended-authorised-volume.service.js')

describe('Submit Amended Authorised Volume Service', () => {
  const billRunId = 'cc4bbb18-0d6a-4254-ac2c-7409de814d7e'
  const licenceId = '9a8a148d-b71e-463c-bea8-bc5e0a5d95e2'

  let payload
  let reviewChargeReference
  let yarStub

  beforeEach(async () => {
    yarStub = { flash: Sinon.stub() }

    reviewChargeReference = await ReviewChargeReferenceHelper.add()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload for authorised volume', () => {
      beforeEach(async () => {
        payload = {
          authorisedVolume: '10',
          totalBillableReturns: '5',
          minVolume: '5',
          maxVolume: '20'
        }
      })

      it('saves the users entered value', async () => {
        await SubmitAmendedAuthorisedVolumeService.go(billRunId, licenceId, reviewChargeReference.id, payload, yarStub)

        const reviewChargeReferenceData = await _fetchReviewChargeReference(reviewChargeReference.id)

        expect(reviewChargeReferenceData.amendedAuthorisedVolume).to.equal(10)
      })

      it('sets the banner message to "The authorised volume for this licence have been updated"', async () => {
        await SubmitAmendedAuthorisedVolumeService.go(billRunId, licenceId, reviewChargeReference.id, payload, yarStub)

        const [flashType, bannerMessage] = yarStub.flash.args[0]

        expect(flashType).to.equal('banner')
        expect(bannerMessage).to.equal('The authorised volume for this licence have been updated')
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        Sinon.stub(FetchAuthorisedVolumeService, 'go').resolves({ billRun: 'bill run', reviewChargeReference: 'charge reference' })
        Sinon.stub(AmendAuthorisedVolumePresenter, 'go').returns(_amendAuthorisedVolumeData())
      })

      describe('because the user left the authorised volume input blank', () => {
        beforeEach(() => {
          payload = {
            totalBillableReturns: '5',
            minVolume: '5',
            maxVolume: '20'
          }
        })

        it('returns the page data for the view', async () => {
          const result = await SubmitAmendedAuthorisedVolumeService.go(
            billRunId, licenceId, reviewChargeReference.id, payload, yarStub
          )

          expect(result).to.equal({
            activeNavBar: 'search',
            pageTitle: 'Set the authorised volume',
            id: '6b3d11f2-d361-4eaa-bce2-5561283bd023',
            amendedAuthorisedVolume: 25.5,
            chargeReference: {
              chargeCategoryId: 'b4354db6-6699-4987-b4c8-d53ac2bf2250',
              chargeCategory: {
                shortDescription: 'Medium loss, non-tidal, greater than 83 up to and including 142 ML/yr',
                minVolume: 83,
                maxVolume: 142
              }
            },
            reviewChargeElements: [{ amendedAllocated: 15 }],
            reviewChargeVersion: {
              chargePeriodStartDate: new Date('2022-04-01'),
              chargePeriodEndDate: new Date('2022-06-01')
            }
          }, { skip: ['error'] })
        })

        it('returns the page data with an error for the authorised volume input element', async () => {
          const result = await SubmitAmendedAuthorisedVolumeService.go(
            billRunId, licenceId, reviewChargeReference.id, payload, yarStub
          )

          expect(result.error).to.equal({
            authorisedVolume: 'Enter an authorised volume'
          })
        })
      })
    })
  })
})

function _amendAuthorisedVolumeData () {
  return {
    id: '6b3d11f2-d361-4eaa-bce2-5561283bd023',
    amendedAuthorisedVolume: 25.5,
    chargeReference: {
      chargeCategoryId: 'b4354db6-6699-4987-b4c8-d53ac2bf2250',
      chargeCategory: {
        shortDescription: 'Medium loss, non-tidal, greater than 83 up to and including 142 ML/yr',
        minVolume: 83,
        maxVolume: 142
      }
    },
    reviewChargeElements: [{
      amendedAllocated: 15
    }],
    reviewChargeVersion: {
      chargePeriodStartDate: new Date('2022-04-01'),
      chargePeriodEndDate: new Date('2022-06-01')
    }
  }
}

async function _fetchReviewChargeReference (id) {
  return ReviewChargeReferenceModel.query()
    .findById(id)
}
