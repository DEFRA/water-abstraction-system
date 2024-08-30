'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ReviewLicenceHelper = require('../../../support/helpers/review-licence.helper.js')

// Thing under test
const SubmitReviewLicenceService = require('../../../../app/services/bill-runs/two-part-tariff/submit-review-licence.service.js')

describe('Submit Review Licence Service', () => {
  const billRunId = '1760c5f9-b868-4d77-adb0-961dfc5f5c5d'
  const licenceId = '7a0388cf-d5e8-4bec-ac5a-bc495d0106b2'

  let payload
  let reviewLicence
  let yarStub

  beforeEach(async () => {
    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called by the status button', () => {
    describe('to set the review licence status to "review"', () => {
      beforeEach(async () => {
        payload = { 'licence-status': 'review' }

        reviewLicence = await ReviewLicenceHelper.add({ billRunId, licenceId, status: 'ready' })
      })

      it('updates the review licence record status to "review"', async () => {
        await SubmitReviewLicenceService.go(billRunId, licenceId, payload, yarStub)

        const refreshedRecord = await reviewLicence.$query()

        expect(refreshedRecord.status).to.equal('review')
      })

      it('sets the banner message to "Licence changed to review."', async () => {
        await SubmitReviewLicenceService.go(billRunId, licenceId, payload, yarStub)

        const [flashType, bannerMessage] = yarStub.flash.args[0]

        expect(flashType).to.equal('banner')
        expect(bannerMessage).to.equal('Licence changed to review.')
      })
    })

    describe('to set the review licence status to "ready"', () => {
      beforeEach(async () => {
        payload = { 'licence-status': 'ready' }

        reviewLicence = await ReviewLicenceHelper.add({ billRunId, licenceId, status: 'review' })
      })

      it('updates the review licence record status to "ready"', async () => {
        await SubmitReviewLicenceService.go(billRunId, licenceId, payload, yarStub)

        const refreshedRecord = await reviewLicence.$query()

        expect(refreshedRecord.status).to.equal('ready')
      })

      it('sets the banner message to "Licence changed to ready."', async () => {
        await SubmitReviewLicenceService.go(billRunId, licenceId, payload, yarStub)

        const [flashType, bannerMessage] = yarStub.flash.args[0]

        expect(flashType).to.equal('banner')
        expect(bannerMessage).to.equal('Licence changed to ready.')
      })
    })
  })

  describe('when called by the progress button', () => {
    describe('to mark the licence as in progress', () => {
      beforeEach(async () => {
        payload = { 'mark-progress': 'mark' }

        reviewLicence = await ReviewLicenceHelper.add({ billRunId, licenceId, progress: false })
      })

      it('updates the review licence record progress to true', async () => {
        await SubmitReviewLicenceService.go(billRunId, licenceId, payload, yarStub)

        const refreshedRecord = await reviewLicence.$query()

        expect(refreshedRecord.progress).to.be.true()
      })

      it('sets the banner message to "This licence has been marked."', async () => {
        await SubmitReviewLicenceService.go(billRunId, licenceId, payload, yarStub)

        const [flashType, bannerMessage] = yarStub.flash.args[0]

        expect(flashType).to.equal('banner')
        expect(bannerMessage).to.equal('This licence has been marked.')
      })
    })

    describe('to remove the progress mark from the licence', () => {
      beforeEach(async () => {
        payload = { 'mark-progress': 'unmark' }

        reviewLicence = await ReviewLicenceHelper.add({ billRunId, licenceId, progress: true })
      })

      it('updates the review licence record progress to false', async () => {
        await SubmitReviewLicenceService.go(billRunId, licenceId, payload, yarStub)

        const refreshedRecord = await reviewLicence.$query()

        expect(refreshedRecord.progress).to.be.false()
      })

      it('sets the banner message to "The progress mark for this licence has been removed."', async () => {
        await SubmitReviewLicenceService.go(billRunId, licenceId, payload, yarStub)

        const [flashType, bannerMessage] = yarStub.flash.args[0]

        expect(flashType).to.equal('banner')
        expect(bannerMessage).to.equal('The progress mark for this licence has been removed.')
      })
    })
  })
})
