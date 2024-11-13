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
            from: 'reviewChargeElementReturns.reviewChargeElementId',
            to: 'reviewChargeElementReturns.reviewReturnId'
          },
          to: 'reviewReturns.id'
        }
      },
      chargeElement: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'charge-element.model',
        join: {
          from: 'reviewChargeElements.chargeElementId',
          to: 'chargeElements.id'
        }
      }
    }
  }
}

module.exports = ReviewChargeElementModel
