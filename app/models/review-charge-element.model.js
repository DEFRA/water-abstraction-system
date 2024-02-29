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
      reviewResults: {
        relation: Model.HasManyRelation,
        modelClass: 'review-result.model',
        join: {
          from: 'reviewChargeElements.id',
          to: 'reviewResults.reviewChargeElementId'
        }
      }
    }
  }
}

module.exports = ReviewChargeElementModel
