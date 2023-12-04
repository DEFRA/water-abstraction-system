'use strict'

/**
 * Model for purposes
 * @module PurposeModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class PurposeModel extends BaseModel {
  static get tableName () {
    return 'purposes'
  }

  static get relationMappings () {
    return {
      chargeElements: {
        relation: Model.HasManyRelation,
        modelClass: 'charge-element.model',
        join: {
          from: 'purposes.id',
          to: 'chargeElements.purposeId'
        }
      },
      chargeReferences: {
        relation: Model.HasManyRelation,
        modelClass: 'charge-reference.model',
        join: {
          from: 'purposes.id',
          to: 'chargeReferences.purposeId'
        }
      }
    }
  }
}

module.exports = PurposeModel
