/**
 * Model for return_requirement_points (water.return_requirement_points)
 * @module ReturnRequirementPointModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'

class ReturnRequirementPointModel extends BaseModel {
  static get tableName() {
    return 'returnRequirementPoints'
  }

  static get relationMappings() {
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

export default ReturnRequirementPointModel
