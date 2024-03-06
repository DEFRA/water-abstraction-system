'use strict'

/**
 * Model for review_charge_elements
 * @module ReviewChargeElementModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ReviewChargeElementModel extends BaseModel {
  static get tableName () {
    return 'reviewChargeElements'
  }

  static get relationMappings () {
    return {
      reviewChargeReference: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'review-charge-reference.model',
        join: {
          from: 'reviewChargeElements.reviewChargeReferenceId',
          to: 'reviewChargeReferences.id'
        }
      },
      reviewReturns: {
        relation: Model.ManyToManyRelation,
        modelClass: 'review-return.model',
        join: {
          from: 'reviewChargeElements.id',
          through: {
            from: 'reviewChargeElementsReturns.reviewChargeElementId',
            to: 'reviewChargeElementsReturns.reviewReturnId'
          },
          to: 'reviewReturns.id'
        }
      }
    }
  }
}

module.exports = ReviewChargeElementModel
