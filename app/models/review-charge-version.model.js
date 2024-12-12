'use strict'

/**
 * Model for review_charge_versions
 * @module ReviewChargeVersionModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ReviewChargeVersionModel extends BaseModel {
  static get tableName() {
    return 'reviewChargeVersions'
  }

  static get relationMappings() {
    return {
      reviewLicence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'review-licence.model',
        join: {
          from: 'reviewChargeVersions.reviewLicenceId',
          to: 'reviewLicences.id'
        }
      },
      reviewChargeReferences: {
        relation: Model.HasManyRelation,
        modelClass: 'review-charge-reference.model',
        join: {
          from: 'reviewChargeVersions.id',
          to: 'reviewChargeReferences.reviewChargeVersionId'
        }
      },
      chargeVersion: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'charge-version.model',
        join: {
          from: 'reviewChargeVersions.chargeVersionId',
          to: 'chargeVersions.id'
        }
      }
    }
  }
}

module.exports = ReviewChargeVersionModel
