'use strict'

/**
 * Model for events (water.events)
 * @module EventModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')
const { Model } = require('objection')

class EventModel extends BaseModel {
  static get tableName() {
    return 'events'
  }

  static get relationMappings() {
    return {
      scheduledNotifications: {
        relation: Model.HasManyRelation,
        modelClass: 'scheduled-notification.model',
        join: {
          from: 'events.id',
          to: 'scheduledNotifications.eventId'
        }
      }
    }
  }
}

module.exports = EventModel
