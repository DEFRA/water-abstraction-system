'use strict'

/**
 * Model for licence_version_purpose_points (water.licence_version_purpose_points)
 * @module LicenceVersionPurposePointModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class LicenceVersionPurposePointModel extends BaseModel {
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
      }
    }
  }
}

module.exports = LicenceVersionPurposePointModel
