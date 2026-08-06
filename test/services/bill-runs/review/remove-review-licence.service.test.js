// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import ReviewChargeElementHelper from 'water-abstraction-engine/test/helpers/review-charge-element.helper.js'
import ReviewChargeElementModel from 'water-abstraction-engine/models/review-charge-element.model.js'
import ReviewChargeElementReturnHelper from 'water-abstraction-engine/test/helpers/review-charge-element-return.helper.js'
import ReviewChargeElementReturnModel from 'water-abstraction-engine/models/review-charge-element-return.model.js'
import ReviewChargeReferenceHelper from 'water-abstraction-engine/test/helpers/review-charge-reference.helper.js'
import ReviewChargeReferenceModel from 'water-abstraction-engine/models/review-charge-reference.model.js'
import ReviewChargeVersionHelper from 'water-abstraction-engine/test/helpers/review-charge-version.helper.js'
import ReviewChargeVersionModel from 'water-abstraction-engine/models/review-charge-version.model.js'
import ReviewLicenceHelper from 'water-abstraction-engine/test/helpers/review-licence.helper.js'
import ReviewLicenceModel from 'water-abstraction-engine/models/review-licence.model.js'
import ReviewReturnHelper from 'water-abstraction-engine/test/helpers/review-return.helper.js'
import ReviewReturnModel from 'water-abstraction-engine/models/review-return.model.js'

// Thing under test
import RemoveReviewLicenceService from '../../../../src/services/bill-runs/review/remove-review-licence.service.js'

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
