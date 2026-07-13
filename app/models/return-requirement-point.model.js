/**
 * Model for return_requirement_points (water.return_requirement_points)
 * @module ReturnRequirementPointModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import PointModel from './point.model.js'
import ReturnRequirementModel from './return-requirement.model.js'

export default class ReturnRequirementPointModel extends BaseModel {
  static get tableName() {
    return 'returnRequirementPoints'
  }

  static get relationMappings() {
    return {
      point: {
        relation: Model.BelongsToOneRelation,
        modelClass: PointModel,
        join: {
          from: 'returnRequirementPoints.pointId',
          to: 'points.id'
        }
      },
      returnRequirement: {
        relation: Model.BelongsToOneRelation,
        modelClass: ReturnRequirementModel,
        join: {
          from: 'returnRequirementPoints.returnRequirementId',
          to: 'returnRequirements.id'
        }
      }
    }
  }
}
