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
      points: {
        relation: Model.ManyToManyRelation,
        modelClass: 'point.model',
        join: {
          from: 'returnRequirements.id',
          through: {
            from: 'returnRequirementPoints.returnRequirementId',
            to: 'returnRequirementPoints.pointId'
          },
          to: 'points.id'
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
