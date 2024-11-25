'use strict'

/**
 * Model for licence_version_purpose_conditions (water.licence_version_purpose_conditions)
 * @module LicenceVersionPurposeConditionModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class LicenceVersionPurposeConditionModel extends BaseModel {
  static get tableName() {
    return 'licenceVersionPurposeConditions'
  }

  static get relationMappings() {
    return {
      licenceMonitoringStations: {
        relation: Model.HasManyRelation,
        modelClass: 'licence-monitoring-station.model',
        join: {
          from: 'licenceVersionPurposeConditions.id',
          to: 'licenceMonitoringStations.licenceVersionPurposeConditionId'
        }
      },
      licenceVersionPurpose: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence-version-purpose.model',
        join: {
          from: 'licenceVersionPurposeConditions.licenceVersionPurposeId',
          to: 'licenceVersionPurposes.id'
        }
      },
      licenceVersionPurposeConditionType: {
        relation: Model.HasOneRelation,
        modelClass: 'licence-version-purpose-condition-type.model',
        join: {
          from: 'licenceVersionPurposeConditions.licenceVersionPurposeConditionTypeId',
          to: 'licenceVersionPurposeConditionTypes.id'
        }
      }
    }
  }
}

module.exports = LicenceVersionPurposeConditionModel
