'use strict'

/**
 * Model for licence_monitoring_stations (water.licence_monitoring_stations)
 * @module LicenceMonitoringStationModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class LicenceMonitoringStationModel extends BaseModel {
  static get tableName() {
    return 'licenceMonitoringStations'
  }

  static get relationMappings() {
    return {
      monitoringStation: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'monitoring-station.model',
        join: {
          from: 'licenceMonitoringStations.monitoringStationId',
          to: 'monitoringStations.id'
        }
      },
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'licenceMonitoringStations.licenceId',
          to: 'licences.id'
        }
      },
      licenceVersionPurposeCondition: {
        relation: Model.HasOneRelation,
        modelClass: 'licence-version-purpose-condition.model',
        join: {
          from: 'licenceMonitoringStations.licenceVersionPurposeConditionId',
          to: 'licenceVersionPurposeConditions.id'
        }
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'user.model',
        join: {
          from: 'licenceMonitoringStations.createdBy',
          to: 'users.id'
        }
      }
    }
  }
}

module.exports = LicenceMonitoringStationModel
