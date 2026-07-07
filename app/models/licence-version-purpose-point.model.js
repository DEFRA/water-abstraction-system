/**
 * Model for licence_version_purpose_points (water.licence_version_purpose_points)
 * @module LicenceVersionPurposePointModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'

class LicenceVersionPurposePointModel extends BaseModel {
  static get tableName() {
    return 'licenceVersionPurposePoints'
  }

  static get relationMappings() {
    return {
      licenceVersionPurpose: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence-version-purpose.model',
        join: {
          from: 'licenceVersionPurposePoints.licenceVersionPurposeId',
          to: 'licenceVersionPurposes.id'
        }
      },
      point: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'point.model',
        join: {
          from: 'licenceVersionPurposePoints.pointId',
          to: 'points.id'
        }
      }
    }
  }
}

export default LicenceVersionPurposePointModel
