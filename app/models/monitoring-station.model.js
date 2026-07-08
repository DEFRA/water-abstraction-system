/**
 * Model for monitoring_stations (water.gauging_stations)
 * @module MonitoringStationModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import LicenceMonitoringStationModel from './licence-monitoring-station.model.js'

class MonitoringStationModel extends BaseModel {
  static get tableName() {
    return 'monitoringStations'
  }

  // Defining which fields contain json allows us to insert an object without needing to stringify it first
  static get jsonAttributes() {
    return ['metadata']
  }

  static get relationMappings() {
    return {
      licenceMonitoringStations: {
        relation: Model.HasManyRelation,
        modelClass: LicenceMonitoringStationModel,
        join: {
          from: 'monitoringStations.id',
          to: 'licenceMonitoringStations.monitoringStationId'
        }
      }
    }
  }
}

export default MonitoringStationModel
