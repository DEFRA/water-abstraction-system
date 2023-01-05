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
}

module.exports = EventModel
