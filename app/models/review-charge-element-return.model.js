'use strict'

/**
 * Model for review_charge_element_return
 * @module ReviewChargeElementReturnModel
 */

const { Model } = require('objection')
const BaseModel = require('./base.model.js')

class ReviewChargeElementReturnModel extends BaseModel {
  static get tableName () {
    return 'reviewChargeElementsReturns'
  }

  static get relationMappings () {
    return {
      reviewChargeElement: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'review-charge-element.model',
        join: {
          from: 'reviewChargeElementsReturns.reviewChargeElementId',
          to: 'reviewChargeElements.id'
        }
      },
      reviewReturn: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'review-return.model',
        join: {
          from: 'reviewChargeElementsReturns.reviewReturnId',
          to: 'reviewReturns.id'
        }
      }
    }
  }
}

module.exports = ReviewChargeElementReturnModel
