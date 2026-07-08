/**
 * Model for review_returns
 * @module ReviewReturnModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import ReturnLogModel from './return-log.model.js'
import ReviewChargeElementModel from './review-charge-element.model.js'
import ReviewChargeElementReturnModel from './review-charge-element-return.model.js'
import ReviewLicenceModel from './review-licence.model.js'

class ReviewReturnModel extends BaseModel {
  static get tableName() {
    return 'reviewReturns'
  }

  // Defining which fields contain json allows us to insert an object without needing to stringify it first
  static get jsonAttributes() {
    return ['purposes']
  }

  static get relationMappings() {
    return {
      returnLog: {
        relation: Model.BelongsToOneRelation,
        modelClass: ReturnLogModel,
        join: {
          from: 'reviewReturns.returnLogId',
          to: 'returnLogs.id'
        }
      },
      reviewChargeElements: {
        relation: Model.ManyToManyRelation,
        modelClass: ReviewChargeElementModel,
        join: {
          from: 'reviewReturns.id',
          through: {
            from: 'reviewChargeElementReturns.reviewReturnId',
            to: 'reviewChargeElementReturns.reviewChargeElementId'
          },
          to: 'reviewChargeElements.id'
        }
      },
      reviewChargeElementReturns: {
        relation: Model.HasManyRelation,
        modelClass: ReviewChargeElementReturnModel,
        join: {
          from: 'reviewReturns.id',
          to: 'reviewChargeElementReturns.reviewReturnId'
        }
      },
      reviewLicence: {
        relation: Model.BelongsToOneRelation,
        modelClass: ReviewLicenceModel,
        join: {
          from: 'reviewReturns.reviewLicenceId',
          to: 'reviewLicences.id'
        }
      }
    }
  }
}

export default ReviewReturnModel
