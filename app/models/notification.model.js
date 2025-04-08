'use strict'

/**
 * Model for notifications (water.scheduled_notification)
 * @module NotificationModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class NotificationModel extends BaseModel {
  static get tableName() {
    return 'notifications'
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
      }
    }
  }
}

module.exports = NotificationModel
