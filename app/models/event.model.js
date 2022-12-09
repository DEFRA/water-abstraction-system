'use strict'

/**
 * Model for water.events
 * @module EventModel
 */

const BaseModel = require('./base.model.js')

class EventModel extends BaseModel {
  static get tableName () {
    return 'water.events'
  }
}

module.exports = EventModel
