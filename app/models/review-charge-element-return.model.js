/**
 * Model for review_charge_elements_returns
 * @module ReviewChargeElementReturnModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import ReviewChargeElementModel from './review-charge-element.model.js'
import ReviewReturnModel from './review-return.model.js'

export default class ReviewChargeElementReturnModel extends BaseModel {
  static get tableName() {
    return 'reviewChargeElementReturns'
  }

  static get relationMappings() {
    return {
      reviewChargeElement: {
        relation: Model.BelongsToOneRelation,
        modelClass: ReviewChargeElementModel,
        join: {
          from: 'reviewChargeElementReturns.reviewChargeElementId',
          to: 'reviewChargeElements.id'
        }
      },
      reviewReturn: {
        relation: Model.BelongsToOneRelation,
        modelClass: ReviewReturnModel,
        join: {
          from: 'reviewChargeElementReturns.reviewReturnId',
          to: 'reviewReturns.id'
        }
      }
    }
  }
}
