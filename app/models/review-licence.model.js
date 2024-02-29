'use strict'

/**
 * Model for review_licences
 * @module ReviewLicenceModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ReviewLicenceModel extends BaseModel {
  static get tableName () {
    return 'reviewLicences'
  }

  static get relationMappings () {
    return {
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'reviewLicences.licenceId',
          to: 'licences.id'
        }
      },
      reviewResults: {
        relation: Model.HasManyRelation,
        modelClass: 'review-result.model',
        join: {
          from: 'reviewLicences.id',
          to: 'reviewResults.reviewLicenceId'
        }
      }
    }
  }
}

module.exports = ReviewLicenceModel
