'use strict'

/**
 * Model for monitoring_stations (water.gauging_stations)
 * @module MonitoringStationModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class MonitoringStationModel extends BaseModel {
  static get tableName () {
    return 'monitoringStations'
  }

  // Defining which fields contain json allows us to insert an object without needing to stringify it first
  static get jsonAttributes () {
    return [
      'metadata'
    ]
  }

  static get relationMappings () {
    return {
      licenceMonitoringStations: {
        relation: Model.HasManyRelation,
        modelClass: 'licence-monitoring-station.model',
        join: {
          from: 'monitoringStations.id',
          to: 'licenceMonitoringStations.monitoringStationId'
        }
      }
    }
  }
}

module.exports = MonitoringStationModel
