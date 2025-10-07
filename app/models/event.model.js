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
    return ['licences', 'metadata', 'statusCounts']
  }

  static get relationMappings() {
    return {
      notifications: {
        relation: Model.HasManyRelation,
        modelClass: 'notification.model',
        join: {
          from: 'events.id',
          to: 'notifications.eventId'
        }
      }
    }
  }
}

module.exports = EventModel
