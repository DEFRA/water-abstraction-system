'use strict'

/**
 * Model for return
 * @module ReturnModel
 */

const { Model } = require('objection')

const ReturnsBaseModel = require('./returns-base.model.js')

class ReturnModel extends ReturnsBaseModel {
  static get tableName () {
    return 'returns'
  }

  static get idColumn () {
    return 'returnId'
  }

  static get translations () {
    return []
  }

  // Defining which fields contain json allows us to insert an object without needing to stringify it first
  static get jsonAttributes () {
    return [
      'metadata'
    ]
  }

  static get relationMappings () {
    return {
      versions: {
        relation: Model.HasManyRelation,
        modelClass: 'version.model',
        join: {
          from: 'returns.returnId',
          to: 'versions.returnId'
        }
      }
    }
  }
}

module.exports = ReturnModel
