'use strict'

/**
 * @module RegionModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class RegionModel extends BaseModel {
  static get tableName () {
    return 'water.regions'
  }

  static get relationMappings () {
    return {
      licences: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'water.regions.region_id',
          to: 'water.licences.region_id'
        }
      }
    }
  }
}

module.exports = RegionModel
