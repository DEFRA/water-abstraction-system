'use strict'

/**
 * Model for review_charge_elements_returns
 * @module ReviewChargeElementReturnModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ReviewChargeElementReturnModel extends BaseModel {
  static get tableName() {
    return 'reviewChargeElementReturns'
  }

  static get relationMappings() {
    return {
      reviewChargeElement: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'review-charge-element.model',
        join: {
          from: 'reviewChargeElementReturns.reviewChargeElementId',
          to: 'reviewChargeElements.id'
        }
      }
    }
  }
}

module.exports = ReviewChargeElementReturnModel
