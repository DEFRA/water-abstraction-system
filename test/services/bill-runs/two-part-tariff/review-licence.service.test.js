'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../../support/database.js')
const ReviewLicenceHelper = require('../../../support/helpers/review-licence.helper.js')
const ReviewLicenceModel = require('../../../../app/models/review-licence.model.js')

// Things we need to stub
const FetchReviewLicenceResultsService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-review-licence-results.service.js')
const ReviewLicencePresenter = require('../../../../app/presenters/bill-runs/two-part-tariff/review-licence.presenter.js')

// Thing under test
const ReviewLicenceService = require('../../../../app/services/bill-runs/two-part-tariff/review-licence.service.js')

describe('Review Licence Service', () => {
  beforeEach(async () => {
    await DatabaseSupport.clean()

    Sinon.stub(FetchReviewLicenceResultsService, 'go').resolves({
      billRun: 'bill run data',
      licence: [{ licenceRef: '7/34/10/*S/0084' }]
    })
    Sinon.stub(ReviewLicencePresenter, 'go').resolves('page data')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when there is data to process', () => {
    const billRunId = '2c80bd22-a005-4cf4-a2a2-73812a9861de'
    const licenceId = '082f528e-4ae4-4f41-ba64-b740a0a210ff'
    const payload = undefined

    it('will fetch the bill run data and return it once formatted by the presenter', async () => {
      const result = await ReviewLicenceService.go(billRunId, licenceId, payload)

      expect(result).to.equal('page data')
    })
  })

  describe('when there is data to process after the user clicking the "Confirm licence is ready" button', () => {
    const payload = { licenceStatus: 'ready' }
    let billRunId
    let licenceId

    beforeEach(async () => {
      const reviewLicence = await ReviewLicenceHelper.add({ status: 'review' })

      billRunId = reviewLicence.billRunId
      licenceId = reviewLicence.licenceId
    })

    it('will set `status` to `ready` in the database and return the page data', async () => {
      const result = await ReviewLicenceService.go(billRunId, licenceId, payload)
      const reviewLicenceQuery = await ReviewLicenceModel.query()
        .where('billRunId', billRunId)
        .andWhere('licenceId', licenceId)
        .first()

      expect(reviewLicenceQuery.status).to.equal('ready')
      expect(result).to.equal('page data')
    })
  })

  describe('when there is data to process after the user clicking the "Put licence into Review" button', () => {
    const payload = { licenceStatus: 'review' }
    let billRunId
    let licenceId

    beforeEach(async () => {
      const reviewLicence = await ReviewLicenceHelper.add({ status: 'ready' })

      billRunId = reviewLicence.billRunId
      licenceId = reviewLicence.licenceId
    })

    it('will set `status` to `review` in the database and return the page data', async () => {
      const result = await ReviewLicenceService.go(billRunId, licenceId, payload)
      const reviewLicenceQuery = await ReviewLicenceModel.query()
        .where('billRunId', billRunId)
        .andWhere('licenceId', licenceId)
        .first()

      expect(reviewLicenceQuery.status).to.equal('review')
      expect(result).to.equal('page data')
    })
  })

  describe('when there is data to process after the user clicking the "Mark progress" button', () => {
    const payload = { marKProgress: 'mark' }
    let billRunId
    let licenceId

    beforeEach(async () => {
      const reviewLicence = await ReviewLicenceHelper.add({ progress: false })

      billRunId = reviewLicence.billRunId
      licenceId = reviewLicence.licenceId
    })

    it('will set `progress` to true in the database and return the page data', async () => {
      const result = await ReviewLicenceService.go(billRunId, licenceId, payload)
      const reviewLicenceQuery = await ReviewLicenceModel.query()
        .where('billRunId', billRunId)
        .andWhere('licenceId', licenceId)
        .first()

      expect(reviewLicenceQuery.progress).to.be.true()
      expect(result).to.equal('page data')
    })
  })

  describe('when there is data to process after the user clicking the "Remove progress mark" button', () => {
    const payload = { marKProgress: 'unmark' }
    let billRunId
    let licenceId

    beforeEach(async () => {
      const reviewLicence = await ReviewLicenceHelper.add({ progress: true })

      billRunId = reviewLicence.billRunId
      licenceId = reviewLicence.licenceId
    })

    it('will set `progress` to false in the database and return the page data', async () => {
      const result = await ReviewLicenceService.go(billRunId, licenceId, payload)
      const reviewLicenceQuery = await ReviewLicenceModel.query()
        .where('billRunId', billRunId)
        .andWhere('licenceId', licenceId)
        .first()

      expect(reviewLicenceQuery.progress).to.be.false()
      expect(result).to.equal('page data')
    })
  })
})
