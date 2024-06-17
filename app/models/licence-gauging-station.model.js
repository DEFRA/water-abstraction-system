'use strict'

/**
 * Model for licence_gauging_stations (water.licence_gauging_stations)
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
      gaugingStation: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'gauging-station.model',
        join: {
          from: 'licenceGaugingStations.gaugingStationId',
          to: 'gaugingStations.id'
        }
      },
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'licenceGaugingStations.licenceId',
          to: 'licences.id'
        }
      }
    }
  }
}

module.exports = LicenceGaugingStationModel
