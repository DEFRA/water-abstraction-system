'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
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
const RemoveReviewLicenceService = require('../../../../app/services/bill-runs/review/remove-review-licence.service.js')

describe('Bill Runs Review - Remove Review Licence service', () => {
  describe('when called', () => {
    let reviewChargeElementId
    let reviewChargeElementReturnId
    let reviewChargeReferenceId
    let reviewChargeVersionId
    let reviewLicence
    let reviewReturnId

    beforeEach(async () => {
      reviewLicence = await ReviewLicenceHelper.add()
      const reviewReturn = await ReviewReturnHelper.add({ reviewLicenceId: reviewLicence.id })

      reviewReturnId = reviewReturn.id
      const reviewChargeVersion = await ReviewChargeVersionHelper.add({ reviewLicenceId: reviewLicence.id })

      reviewChargeVersionId = reviewChargeVersion.id
      const reviewChargeReference = await ReviewChargeReferenceHelper.add({ reviewChargeVersionId })

      reviewChargeReferenceId = reviewChargeReference.id
      const reviewChargeElement = await ReviewChargeElementHelper.add({ reviewChargeReferenceId })

      reviewChargeElementId = reviewChargeElement.id
      const reviewChargeElementReturn = await ReviewChargeElementReturnHelper.add({ reviewChargeElementId })

      reviewChargeElementReturnId = reviewChargeElementReturn.id
    })

    it('will remove the records relating to the review licence from the review tables', async () => {
      await RemoveReviewLicenceService.go(reviewLicence.id)

      expect(await ReviewLicenceModel.query().findById(reviewLicence.id)).to.be.undefined()
      expect(await ReviewReturnModel.query().findById(reviewReturnId)).to.be.undefined()
      expect(await ReviewChargeVersionModel.query().findById(reviewChargeVersionId)).to.be.undefined()
      expect(await ReviewChargeReferenceModel.query().findById(reviewChargeReferenceId)).to.be.undefined()
      expect(await ReviewChargeElementModel.query().findById(reviewChargeElementId)).to.be.undefined()
      expect(await ReviewChargeElementReturnModel.query().findById(reviewChargeElementReturnId)).to.be.undefined()
    })
  })
})
