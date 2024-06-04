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
      returnRequirements: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'return-requirement.model',
        join: {
          from: 'returnRequirements.id',
          to: 'returnRequirementPoints.returnRequirementId'
        }
      }
    }
  }
}

module.exports = ReturnRequirementPointModel
