// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import ReviewChargeElementHelper from '../../../support/helpers/review-charge-element.helper.js'
import ReviewChargeElementModel from '../../../../app/models/review-charge-element.model.js'
import ReviewChargeElementReturnHelper from '../../../support/helpers/review-charge-element-return.helper.js'
import ReviewChargeElementReturnModel from '../../../../app/models/review-charge-element-return.model.js'
import ReviewChargeReferenceHelper from '../../../support/helpers/review-charge-reference.helper.js'
import ReviewChargeReferenceModel from '../../../../app/models/review-charge-reference.model.js'
import ReviewChargeVersionHelper from '../../../support/helpers/review-charge-version.helper.js'
import ReviewChargeVersionModel from '../../../../app/models/review-charge-version.model.js'
import ReviewLicenceHelper from '../../../support/helpers/review-licence.helper.js'
import ReviewLicenceModel from '../../../../app/models/review-licence.model.js'
import ReviewReturnHelper from '../../../support/helpers/review-return.helper.js'
import ReviewReturnModel from '../../../../app/models/review-return.model.js'

// Thing under test
import RemoveReviewLicenceService from '../../../../app/services/bill-runs/review/remove-review-licence.service.js'

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
      await RemoveReviewLicenceService(reviewLicence.id)

      expect(await ReviewLicenceModel.query().findById(reviewLicence.id)).toBeUndefined()
      expect(await ReviewReturnModel.query().findById(reviewReturnId)).toBeUndefined()
      expect(await ReviewChargeVersionModel.query().findById(reviewChargeVersionId)).toBeUndefined()
      expect(await ReviewChargeReferenceModel.query().findById(reviewChargeReferenceId)).toBeUndefined()
      expect(await ReviewChargeElementModel.query().findById(reviewChargeElementId)).toBeUndefined()
      expect(await ReviewChargeElementReturnModel.query().findById(reviewChargeElementReturnId)).toBeUndefined()
    })
  })
})
