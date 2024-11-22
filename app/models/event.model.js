'use strict'

/**
 * Model for events (water.events)
 * @module EventModel
 */

const BaseModel = require('./base.model.js')

class EventModel extends BaseModel {
  static get tableName() {
    return 'events'
  }
}

module.exports = EventModel
