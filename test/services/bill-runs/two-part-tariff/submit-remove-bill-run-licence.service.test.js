'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const BillRunModel = require('../../../../app/models/bill-run.model.js')
const DatabaseSupport = require('../../../support/database.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const LicenceModel = require('../../../../app/models/licence.model.js')
const ReviewChargeElementHelper = require('../../../support/helpers/review-charge-element.helper.js')
const ReviewChargeElementModel = require('../../../../app/models/review-charge-element.model.js')
const ReviewChargeElementReturnHelper = require('../../../support/helpers/review-charge-element-return.helper.js')
const ReviewChargeElementReturnModel = require('../../../../app/models/review-charge-element-return.model.js')
const ReviewChargeReferenceHelper = require('../../../support/helpers/review-charge-reference.helper.js')
const ReviewChargeReferenceModel = require('../../../../app/models/review-charge-reference.model.js')
const ReviewChargeVersionHelper = require('../../../support/helpers/review-charge-version.helper.js')
const ReviewChargeVersionModel = require('../../../../app/models/review-charge-version.model.js')
const ReviewLicenceHelper = require('../../../support/helpers/review-licence.helper.js')
const ReviewLicenceModel = require('../../../../app/models/review-licence.model.js')
const ReviewReturnHelper = require('../../../support/helpers/review-return.helper.js')
const ReviewReturnModel = require('../../../../app/models/review-return.model.js')

// Thing under test
const SubmitRemoveBillRunLicenceService = require('../../../../app/services/bill-runs/two-part-tariff/submit-remove-bill-run-licence.service.js')

describe('Submit Remove Bill Run Licence service', () => {
  let yarStub

  beforeEach(async () => {
    await DatabaseSupport.clean()

    yarStub = { flash: Sinon.stub() }
  })

  describe('when called with a valid billRunId & licenceId', () => {
    let billRunId
    let licenceId
    let reviewChargeElementId
    let reviewChargeElementReturnId
    let reviewChargeReferenceId
    let reviewChargeVersionId
    let reviewReturnId

    beforeEach(async () => {
      const billRun = await BillRunHelper.add({ status: 'review' })
      billRunId = billRun.id

      const licence = await LicenceHelper.add({ licenceRef: '01/123/ABC' })
      licenceId = licence.id
      const { id: reviewLicenceId } = await ReviewLicenceHelper.add({ billRunId, licenceId })
      const reviewReturn = await ReviewReturnHelper.add({ reviewLicenceId })
      reviewReturnId = reviewReturn.id
      const reviewChargeVersion = await ReviewChargeVersionHelper.add({ reviewLicenceId })
      reviewChargeVersionId = reviewChargeVersion.id
      const reviewChargeReference = await ReviewChargeReferenceHelper.add({ reviewChargeVersionId })
      reviewChargeReferenceId = reviewChargeReference.id
      const reviewChargeElement = await ReviewChargeElementHelper.add({ reviewChargeReferenceId })
      reviewChargeElementId = reviewChargeElement.id
      const reviewChargeElementReturn = await ReviewChargeElementReturnHelper.add({ reviewChargeElementId })
      reviewChargeElementReturnId = reviewChargeElementReturn.id
    })

    describe('which has at least one licence remaining in the bill run after the licence is removed', () => {
      beforeEach(async () => {
        // add an extra record to the `reviewLicence` table so that it isn't empty when the licence is removed
        await ReviewLicenceHelper.add({ billRunId })
      })

      it('will remove the records relating to the licence from the review tables', async () => {
        await SubmitRemoveBillRunLicenceService.go(billRunId, licenceId, yarStub)

        expect(await ReviewLicenceModel.query().where('licenceId', licenceId)).to.be.empty()
        expect(await ReviewReturnModel.query().findById(reviewReturnId)).to.be.undefined()
        expect(await ReviewChargeVersionModel.query().findById(reviewChargeVersionId)).to.be.undefined()
        expect(await ReviewChargeReferenceModel.query().findById(reviewChargeReferenceId)).to.be.undefined()
        expect(await ReviewChargeElementModel.query().findById(reviewChargeElementId)).to.be.undefined()
        expect(await ReviewChargeElementReturnModel.query().findById(reviewChargeElementReturnId)).to.be.undefined()
      })

      it('will return false as all licences are not removed and generate a banner message', async () => {
        const result = await SubmitRemoveBillRunLicenceService.go(billRunId, licenceId, yarStub)
        const [flashType, bannerMessage] = yarStub.flash.args[0]

        expect(result).to.be.false()

        expect(yarStub.flash.called).to.be.true()
        expect(flashType).to.equal('banner')
        expect(bannerMessage).to.equal('Licence 01/123/ABC removed from the bill run.')
      })
    })

    describe('which has NO licences remain in the bill run after the licence is removed', () => {
      it('will remove the records relating to the licence from the review tables', async () => {
        await SubmitRemoveBillRunLicenceService.go(billRunId, licenceId, yarStub)

        expect(await ReviewLicenceModel.query().where('licenceId', licenceId)).to.be.empty()
        expect(await ReviewReturnModel.query().findById(reviewReturnId)).to.be.undefined()
        expect(await ReviewChargeVersionModel.query().findById(reviewChargeVersionId)).to.be.undefined()
        expect(await ReviewChargeReferenceModel.query().findById(reviewChargeReferenceId)).to.be.undefined()
        expect(await ReviewChargeElementModel.query().findById(reviewChargeElementId)).to.be.undefined()
        expect(await ReviewChargeElementReturnModel.query().findById(reviewChargeElementReturnId)).to.be.undefined()
      })

      it('will return true as no licences remain in the bill run and NO banner message is generated', async () => {
        const result = await SubmitRemoveBillRunLicenceService.go(billRunId, licenceId, yarStub)

        expect(result).to.be.true()
        expect(yarStub.flash.called).to.be.false()
      })

      it('will set the bill run status to empty', async () => {
        await SubmitRemoveBillRunLicenceService.go(billRunId, licenceId, yarStub)
        const { status } = await BillRunModel.query().findById(billRunId).select('status')

        expect(status).to.equal('empty')
      })

      it('will mark the licence for two-part tariff supplementary billing', async () => {
        await SubmitRemoveBillRunLicenceService.go(billRunId, licenceId, yarStub)
        const { includeInSrocTptBilling } = await LicenceModel.query().findById(licenceId).select('includeInSrocTptBilling')

        expect(includeInSrocTptBilling).to.be.true()
      })
    })
  })
})
