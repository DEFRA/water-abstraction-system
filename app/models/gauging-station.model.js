'use strict'

/**
 * Model for gauginStations (water.gauging_stations)
 * @module GauginStationsnModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class GauginStationsnModel extends BaseModel {
  static get tableName () {
    return 'gaugingStations'
  }

  static get relationMappings () {
    return {
      licenceGaugingStations: {
        relation: Model.HasManyRelation,
        modelClass: 'licence-gauging-station.model',
        join: {
          from: 'gaugingStations.gaugingStationId',
          to: 'licenceGaugingStations.gaugingStationId'
        }
      }
    }
  }
}

module.exports = GauginStationsnModel
