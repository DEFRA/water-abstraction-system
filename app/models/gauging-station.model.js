'use strict'

/**
 * Model for gauging_stations (water.gauging_stations)
 * @module GaugingStationModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class GaugingStationModel extends BaseModel {
  static get tableName () {
    return 'gaugingStations'
  }

  // Defining which fields contain json allows us to insert an object without needing to stringify it first
  static get jsonAttributes () {
    return [
      'metadata'
    ]
  }

  static get relationMappings () {
    return {
      licenceGaugingStations: {
        relation: Model.HasManyRelation,
        modelClass: 'licence-gauging-station.model',
        join: {
          from: 'gaugingStations.id',
          to: 'licenceGaugingStations.gaugingStationId'
        }
      }
    }
  }
}

module.exports = GaugingStationModel
