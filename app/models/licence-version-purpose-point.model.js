/**
 * Model for licence_version_purpose_points (water.licence_version_purpose_points)
 * @module LicenceVersionPurposePointModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import LicenceVersionPurposeModel from './licence-version-purpose.model.js'
import PointModel from './point.model.js'

export default class LicenceVersionPurposePointModel extends BaseModel {
  static get tableName() {
    return 'licenceVersionPurposePoints'
  }

  static get relationMappings() {
    return {
      licenceVersionPurpose: {
        relation: Model.BelongsToOneRelation,
        modelClass: LicenceVersionPurposeModel,
        join: {
          from: 'licenceVersionPurposePoints.licenceVersionPurposeId',
          to: 'licenceVersionPurposes.id'
        }
      },
      point: {
        relation: Model.BelongsToOneRelation,
        modelClass: PointModel,
        join: {
          from: 'licenceVersionPurposePoints.pointId',
          to: 'points.id'
        }
      }
    }
  }
}