'use strict'

/**
 * Model for primary_purposes (water.purposes_primary)
 * @module PrimaryPurposeModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class PrimaryPurposeModel extends BaseModel {
  static get tableName() {
    return 'primaryPurposes'
  }

  static get relationMappings() {
    return {
      licenceVersionPurposes: {
        relation: Model.HasManyRelation,
        modelClass: 'licence-version-purpose.model',
        join: {
          from: 'primaryPurposes.id',
          to: 'licenceVersionPurposes.primaryPurposeId'
        }
      },
      returnRequirementPurposes: {
        relation: Model.HasManyRelation,
        modelClass: 'return-requirement-purpose.model',
        join: {
          from: 'primaryPurposes.id',
          to: 'returnRequirementPurposes.primaryPurposeId'
        }
      }
    }
  }
}

module.exports = PrimaryPurposeModel
