'use strict'

/**
 * Model for scheduled_notification (water.scheduled_notification)
 * @module ScheduledNotificationModel
 */

const BaseModel = require('./base.model.js')
const { Model } = require('objection')

class ScheduledNotificationModel extends BaseModel {
  static get tableName () {
    return 'scheduled_notification'
  }

  static get relationMappings () {
    return {
      event: {
        relation: Model.HasOneRelation,
        modelClass: 'event.model',
        join: {
          from: 'scheduled_notification.eventId',
          to: 'events.id'
        }
      }
    }
  }
}

module.exports = ScheduledNotificationModel
