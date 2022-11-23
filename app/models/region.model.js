'use strict'

/**
 * @module RegionModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class RegionModel extends BaseModel {
  static get tableName () {
    return 'regions'
  }

  static get relationMappings () {
    return {
      licences: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'regions.region_id',
          to: 'licences.region_id'
        }
      }
    }
  }
}

module.exports = RegionModel
