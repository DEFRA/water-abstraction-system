'use strict'

/**
 * Model for notifications (water.notification)
 * @module NotificationModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class NotificationModel extends BaseModel {
  static get tableName() {
    return 'notifications'
  }

  // Defining which fields contain json allows us to insert an object without needing to stringify it first
  static get jsonAttributes() {
    return ['licences', 'personalisation', 'returnLogIds']
  }

  static get relationMappings() {
    return {
      event: {
        relation: Model.HasOneRelation,
        modelClass: 'event.model',
        join: {
          from: 'notifications.eventId',
          to: 'events.id'
        }
      },
      licenceMonitoringStation: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence-monitoring-station.model',
        join: {
          from: 'notifications.licenceMonitoringStationId',
          to: 'licenceMonitoringStations.id'
        }
      }
    }
  }
}

module.exports = NotificationModel
