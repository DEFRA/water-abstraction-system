'use strict'

/**
 * Model for licenceGaugingStations (water.licence_gauging_stations)
 * @module LicenceGaugingStationModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class LicenceGaugingStationModel extends BaseModel {
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
          to: 'gaugingStations.id'
        }
      }
    }
  }
}

module.exports = LicenceGaugingStationModel
