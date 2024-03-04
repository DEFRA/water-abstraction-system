'use strict'

/**
 * Model for licenceGauginStations (water.licence_gauging_stations)
 * @module GauginStationsnModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class LicenceGauginStationsnModel extends BaseModel {
  static get tableName () {
    return 'licenceGaugingStations'
  }

  static get relationMappings () {
    return {
      licenceGaugingStations: {
        relation: Model.HasManyRelation,
        modelClass: 'gauging-station.model',
        join: {
          from: 'licenceGaugingStations.gaugingStationId',
          to: 'gaugingStations.gaugingStationId'
        }
      }
    }
  }
}

module.exports = LicenceGauginStationsnModel
