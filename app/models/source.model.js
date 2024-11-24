'use strict'

/**
 * Model for sources (water.sources)
 * @module SourceModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class SourceModel extends BaseModel {
  static get tableName() {
    return 'sources'
  }

  static get relationMappings() {
    return {
      points: {
        relation: Model.HasManyRelation,
        modelClass: 'point.model',
        join: {
          from: 'sources.id',
          to: 'points.sourceId'
        }
      }
    }
  }
}

module.exports = SourceModel
