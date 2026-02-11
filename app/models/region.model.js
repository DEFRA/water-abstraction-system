'use strict'

/**
 * Model for regions (water.regions)
 * @module RegionModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class RegionModel extends BaseModel {
  static get tableName() {
    return 'regions'
  }

  static get relationMappings() {
    return {
      billRuns: {
        relation: Model.HasManyRelation,
        modelClass: 'bill-run.model',
        join: {
          from: 'regions.id',
          to: 'billRuns.regionId'
        }
      },
      companies: {
        relation: Model.HasManyRelation,
        modelClass: 'company.model',
        join: {
          from: 'regions.id',
          to: 'companies.regionId'
        }
      },
      licences: {
        relation: Model.HasManyRelation,
        modelClass: 'licence.model',
        join: {
          from: 'regions.id',
          to: 'licences.regionId'
        }
      }
    }
  }
}

module.exports = RegionModel
