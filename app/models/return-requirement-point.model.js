'use strict'

/**
 * Model for return_requirement_points (water.return_requirement_points)
 * @module ReturnRequirementPointModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ReturnRequirementPointModel extends BaseModel {
  static get tableName () {
    return 'returnRequirementPoints'
  }

  static get relationMappings () {
    return {
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
