'use strict'

/**
 * Model for return_requirements (water.return_requirements)
 * @module ReturnRequirementModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ReturnRequirementModel extends BaseModel {
  static get tableName () {
    return 'returnRequirements'
  }

  static get relationMappings () {
    return {
      returnRequirementPoints: {
        relation: Model.HasManyRelation,
        modelClass: 'return-requirement-point.model',
        join: {
          from: 'returnRequirements.id',
          to: 'returnRequirementPoints.returnRequirementId'
        }
      },
      returnRequirementPurposes: {
        relation: Model.HasManyRelation,
        modelClass: 'return-requirement-purpose.model',
        join: {
          from: 'returnRequirements.id',
          to: 'returnRequirementPurposes.returnRequirementId'
        }
      },
      returnVersion: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'return-version.model',
        join: {
          from: 'returnRequirements.returnVersionId',
          to: 'returnVersions.id'
        }
      }
    }
  }
}

module.exports = ReturnRequirementModel
