'use strict'

/**
 * Model for events
 * @module EventModel
 */

const WaterBaseModel = require('./water-base.model.js')

class EventModel extends WaterBaseModel {
  static get tableName () {
    return 'events'
  }

  static get idColumn () {
    return 'eventId'
  }

  static get translations () {
    return [
      { database: 'created', model: 'createdAt' },
      { database: 'modified', model: 'updatedAt' }
    ]
  }
}

module.exports = EventModel
