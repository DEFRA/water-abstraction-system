/**
 * Model for licence_monitoring_stations (water.licence_monitoring_stations)
 * @module LicenceMonitoringStationModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import LicenceModel from './licence.model.js'
import LicenceVersionPurposeConditionModel from './licence-version-purpose-condition.model.js'
import MonitoringStationModel from './monitoring-station.model.js'
import NotificationModel from './notification.model.js'
import UserModel from './user.model.js'

export default class LicenceMonitoringStationModel extends BaseModel {
  static get tableName() {
    return 'licenceMonitoringStations'
  }

  static get relationMappings() {
    return {
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: LicenceModel,
        join: {
          from: 'licenceMonitoringStations.licenceId',
          to: 'licences.id'
        }
      },
      licenceVersionPurposeCondition: {
        relation: Model.HasOneRelation,
        modelClass: LicenceVersionPurposeConditionModel,
        join: {
          from: 'licenceMonitoringStations.licenceVersionPurposeConditionId',
          to: 'licenceVersionPurposeConditions.id'
        }
      },
      monitoringStation: {
        relation: Model.BelongsToOneRelation,
        modelClass: MonitoringStationModel,
        join: {
          from: 'licenceMonitoringStations.monitoringStationId',
          to: 'monitoringStations.id'
        }
      },
      notifications: {
        relation: Model.HasManyRelation,
        modelClass: NotificationModel,
        join: {
          from: 'licenceMonitoringStations.id',
          to: 'notifications.licenceMonitoringStationId'
        }
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: UserModel,
        join: {
          from: 'licenceMonitoringStations.createdBy',
          to: 'users.userId'
        }
      }
    }
  }
}