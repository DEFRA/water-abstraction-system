'use strict'

/**
 * Model for licence_version_purpose_points (water.licence_version_purpose_points)
 * @module LicenceVersionPurposePointModel
 */

const { Model } = require('objection')

const BasePointModel = require('./base-point.model.js')

class LicenceVersionPurposePointModel extends BasePointModel {
  static get tableName () {
    return 'licenceVersionPurposePoints'
  }

  static get relationMappings () {
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

module.exports = LicenceVersionPurposePointModel
