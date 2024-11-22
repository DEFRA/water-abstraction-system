'use strict'

/**
 * Model for purposes (water.purposes_uses)
 * @module PurposeModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class PurposeModel extends BaseModel {
  static get tableName() {
    return 'purposes'
  }

  static get relationMappings() {
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
      },
      licenceVersionPurposes: {
        relation: Model.HasManyRelation,
        modelClass: 'licence-version-purpose.model',
        join: {
          from: 'purposes.id',
          to: 'licenceVersionPurposes.purposeId'
        }
      },
      returnRequirementPurposes: {
        relation: Model.HasManyRelation,
        modelClass: 'return-requirement-purpose.model',
        join: {
          from: 'purposes.id',
          to: 'returnRequirementPurposes.purposeId'
        }
      }
    }
  }
}

module.exports = PurposeModel
