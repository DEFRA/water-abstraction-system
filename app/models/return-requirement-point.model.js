'use strict'

/**
 * Model for return_requirement_points (water.return_requirement_points)
 * @module ReturnRequirementPointModel
 */

const { Model } = require('objection')

const BasePointModel = require('./base-point.model.js')

class ReturnRequirementPointModel extends BasePointModel {
  static get tableName () {
    return 'returnRequirementPoints'
  }

  static get relationMappings () {
    return {
      point: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'point.model',
        join: {
          from: 'returnRequirementPoints.pointId',
          to: 'points.id'
        }
      },
      returnRequirement: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'return-requirement.model',
        join: {
          from: 'returnRequirementPoints.returnRequirementId',
          to: 'returnRequirements.id'
        }
      }
    }
  }
}

module.exports = ReturnRequirementPointModel
