'use strict'

/**
 * Model for scheduled_notifications (water.scheduled_notification)
 * @module ScheduledNotificationModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ScheduledNotificationModel extends BaseModel {
  static get tableName() {
    return 'scheduledNotifications'
  }

  static get relationMappings() {
    return {
      event: {
        relation: Model.HasOneRelation,
        modelClass: 'event.model',
        join: {
          from: 'scheduledNotifications.eventId',
          to: 'events.id'
        }
      }
    }
  }
}

module.exports = ScheduledNotificationModel
