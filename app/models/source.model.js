/**
 * Model for sources (water.sources)
 * @module SourceModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'

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

export default SourceModel
