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

  $parseDatabaseJson (json) {
    json = super.$parseDatabaseJson(json)
    json.createdAt = json.created
    json.updatedAt = json.modified

    delete json.created
    delete json.modified

    return json
  }

  $formatDatabaseJson (json) {
    json = super.$formatDatabaseJson(json)
    json.created = json.createdAt
    json.modified = json.updatedAt

    delete json.createdAt
    delete json.updatedAt

    return json
  }
}

module.exports = EventModel
