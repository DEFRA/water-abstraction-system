'use strict'

/**
 * Model for review_licences
 * @module ReviewLicenceModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ReviewLicenceModel extends BaseModel {
  static get tableName() {
    return 'reviewLicences'
  }

  static get relationMappings() {
    return {
      billRun: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'bill-run.model',
        join: {
          from: 'reviewLicences.billRunId',
          to: 'billRuns.id'
        }
      },
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'reviewLicences.licenceId',
          to: 'licences.id'
        }
      },
      reviewChargeVersions: {
        relation: Model.HasManyRelation,
        modelClass: 'review-charge-version.model',
        join: {
          from: 'reviewLicences.id',
          to: 'reviewChargeVersions.reviewLicenceId'
        }
      },
      reviewReturns: {
        relation: Model.HasManyRelation,
        modelClass: 'review-return.model',
        join: {
          from: 'reviewLicences.id',
          to: 'reviewReturns.reviewLicenceId'
        }
      }
    }
  }
}

module.exports = ReviewLicenceModel
