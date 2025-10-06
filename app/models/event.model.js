'use strict'

/**
 * Model for events (water.events)
 * @module EventModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class EventModel extends BaseModel {
  static get tableName() {
    return 'events'
  }

  // Defining which fields contain json allows us to insert an object without needing to stringify it first
  static get jsonAttributes() {
    return ['licences', 'metadata']
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
