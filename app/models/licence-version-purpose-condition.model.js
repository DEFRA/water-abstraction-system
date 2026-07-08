/**
 * Model for licence_version_purpose_conditions (water.licence_version_purpose_conditions)
 * @module LicenceVersionPurposeConditionModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import LicenceMonitoringStationModel from './licence-monitoring-station.model.js'
import LicenceVersionPurposeConditionTypeModel from './licence-version-purpose-condition-type.model.js'
import LicenceVersionPurposeModel from './licence-version-purpose.model.js'

export default class LicenceVersionPurposeConditionModel extends BaseModel {
  static get tableName() {
    return 'licenceVersionPurposeConditions'
  }

  static get relationMappings() {
    return {
      licenceMonitoringStations: {
        relation: Model.HasManyRelation,
        modelClass: LicenceMonitoringStationModel,
        join: {
          from: 'licenceVersionPurposeConditions.id',
          to: 'licenceMonitoringStations.licenceVersionPurposeConditionId'
        }
      },
      licenceVersionPurpose: {
        relation: Model.BelongsToOneRelation,
        modelClass: LicenceVersionPurposeModel,
        join: {
          from: 'licenceVersionPurposeConditions.licenceVersionPurposeId',
          to: 'licenceVersionPurposes.id'
        }
      },
      licenceVersionPurposeConditionType: {
        relation: Model.HasOneRelation,
        modelClass: LicenceVersionPurposeConditionTypeModel,
        join: {
          from: 'licenceVersionPurposeConditions.licenceVersionPurposeConditionTypeId',
          to: 'licenceVersionPurposeConditionTypes.id'
        }
      }
    }
  }
}