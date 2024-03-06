'use strict'

/**
 * Model for review_charge_references
 * @module ReviewChargeReferenceModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ReviewChargeReferenceModel extends BaseModel {
  static get tableName () {
    return 'reviewChargeReferences'
  }

  static get relationMappings () {
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
        modelClass: 'review-charge-elements.model',
        join: {
          from: 'reviewChargeReferences.id',
          to: 'reviewChargeElements.reviewChargeReferenceId'
        }
      }
    }
  }
}

module.exports = ReviewChargeReferenceModel
