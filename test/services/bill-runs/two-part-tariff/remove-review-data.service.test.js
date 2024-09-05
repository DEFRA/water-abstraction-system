'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../../support/database.js')
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
const RemoveReviewDataService = require('../../../../app/services/bill-runs/two-part-tariff/remove-review-data.service.js')

describe('Remove Review Data service', () => {
  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('when called with a valid billRunId & licenceId', () => {
    const billRunId = 'f54005c6-66bc-43d7-a7e8-d162e6ebc317'
    const licenceId = '41f1ad1d-0f25-4b2f-bc0a-4b38131db12a'

    let reviewChargeElementId
    let reviewChargeElementReturnId
    let reviewChargeReferenceId
    let reviewChargeVersionId
    let reviewReturnId

    beforeEach(async () => {
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

    it('will remove the records relating to the licence from the review tables', async () => {
      await RemoveReviewDataService.go(billRunId, licenceId)

      expect(await ReviewLicenceModel.query().where('licenceId', licenceId)).to.be.empty()
      expect(await ReviewReturnModel.query().findById(reviewReturnId)).to.be.undefined()
      expect(await ReviewChargeVersionModel.query().findById(reviewChargeVersionId)).to.be.undefined()
      expect(await ReviewChargeReferenceModel.query().findById(reviewChargeReferenceId)).to.be.undefined()
      expect(await ReviewChargeElementModel.query().findById(reviewChargeElementId)).to.be.undefined()
      expect(await ReviewChargeElementReturnModel.query().findById(reviewChargeElementReturnId)).to.be.undefined()
    })
  })
})
