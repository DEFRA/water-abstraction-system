'use strict'

/**
 * Model for review_charge_elements_returns
 * @module ReviewChargeElementsReturnModel
 */

const { Model } = require('objection')
const BaseModel = require('./base.model.js')

class ReviewChargeElementsReturnModel extends BaseModel {
  static get tableName () {
    return 'reviewChargeElementsReturns'
  }

  static get relationMappings () {
    return {
      reviewChargeElement: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'ReviewChargeElementModel',
        join: {
          from: 'reviewChargeElementsReturns.reviewChargeElementId',
          to: 'reviewChargeElements.id'
        }
      },
      reviewReturn: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'ReviewReturnModel',
        join: {
          from: 'reviewChargeElementsReturns.reviewReturnId',
          to: 'reviewReturns.id'
        }
      }
    }
  }
}

module.exports = ReviewChargeElementsReturnModel

// Need to sort the model for the join table, not sure on the relation!!!!
