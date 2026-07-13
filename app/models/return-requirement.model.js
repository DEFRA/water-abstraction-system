/**
 * Model for return_requirements (water.return_requirements)
 * @module ReturnRequirementModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import PointModel from './point.model.js'
import ReturnLogModel from './return-log.model.js'
import ReturnRequirementPurposeModel from './return-requirement-purpose.model.js'
import ReturnVersionModel from './return-version.model.js'

export default class ReturnRequirementModel extends BaseModel {
  static get tableName() {
    return 'returnRequirements'
  }

  static get relationMappings() {
    return {
      points: {
        relation: Model.ManyToManyRelation,
        modelClass: PointModel,
        join: {
          from: 'returnRequirements.id',
          through: {
            from: 'returnRequirementPoints.returnRequirementId',
            to: 'returnRequirementPoints.pointId'
          },
          to: 'points.id'
        }
      },
      returnLogs: {
        relation: Model.HasManyRelation,
        modelClass: ReturnLogModel,
        join: {
          from: 'returnRequirements.id',
          to: 'returnLogs.returnRequirementId'
        }
      },
      returnRequirementPurposes: {
        relation: Model.HasManyRelation,
        modelClass: ReturnRequirementPurposeModel,
        join: {
          from: 'returnRequirements.id',
          to: 'returnRequirementPurposes.returnRequirementId'
        }
      },
      returnVersion: {
        relation: Model.BelongsToOneRelation,
        modelClass: ReturnVersionModel,
        join: {
          from: 'returnRequirements.returnVersionId',
          to: 'returnVersions.id'
        }
      }
    }
  }
}
