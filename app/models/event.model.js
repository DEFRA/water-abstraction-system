'use strict'

/**
 * Model for events
 * @module EventModel
 */

const BaseModel = require('./base.model.js')

class EventModel extends BaseModel {
  static get tableName () {
    return 'events'
  }

  static get idColumn () {
    return 'eventId'
  }
}

module.exports = EventModel
