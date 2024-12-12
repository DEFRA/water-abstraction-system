'use strict'

/**
 * Model for review_returns
 * @module ReviewReturnModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ReviewReturnModel extends BaseModel {
  static get tableName() {
    return 'reviewReturns'
  }

  // Defining which fields contain json allows us to insert an object without needing to stringify it first
  static get jsonAttributes() {
    return ['purposes']
  }

  static get relationMappings() {
    return {
      reviewLicence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'review-licence.model',
        join: {
          from: 'reviewReturns.reviewLicenceId',
          to: 'reviewLicences.id'
        }
      },
      returnLog: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'return-log.model',
        join: {
          from: 'reviewReturns.returnId',
          to: 'returnLogs.id'
        }
      },
      reviewChargeElements: {
        relation: Model.ManyToManyRelation,
        modelClass: 'review-charge-element.model',
        join: {
          from: 'reviewReturns.id',
          through: {
            from: 'reviewChargeElementReturns.reviewReturnId',
            to: 'reviewChargeElementReturns.reviewChargeElementId'
          },
          to: 'reviewChargeElements.id'
        }
      }
    }
  }
}

module.exports = ReviewReturnModel
