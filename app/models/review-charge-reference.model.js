'use strict'

/**
 * Model for review_charge_references
 * @module ReviewChargeReferenceModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ReviewChargeReferenceModel extends BaseModel {
  static get tableName() {
    return 'reviewChargeReferences'
  }

  static get relationMappings() {
    return {
      reviewChargeVersion: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'review-charge-version.model',
        join: {
          from: 'reviewChargeReferences.reviewChargeVersionId',
          to: 'reviewChargeVersions.id'
        }
      },
      reviewChargeElements: {
        relation: Model.HasManyRelation,
        modelClass: 'review-charge-element.model',
        join: {
          from: 'reviewChargeReferences.id',
          to: 'reviewChargeElements.reviewChargeReferenceId'
        }
      },
      chargeReference: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'charge-reference.model',
        join: {
          from: 'reviewChargeReferences.chargeReferenceId',
          to: 'chargeReferences.id'
        }
      }
    }
  }
}

module.exports = ReviewChargeReferenceModel
