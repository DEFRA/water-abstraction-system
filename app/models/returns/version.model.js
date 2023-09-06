'use strict'

/**
 * Model for version
 * @module VersionModel
 */

const { Model } = require('objection')

const ReturnsBaseModel = require('./returns-base.model.js')

class VersionModel extends ReturnsBaseModel {
  static get tableName () {
    return 'versions'
  }

  static get idColumn () {
    return 'versionId'
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
      return: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'return.model',
        join: {
          from: 'versions.returnId',
          to: 'returns.returnId'
        }
      },
      lines: {
        relation: Model.HasManyRelation,
        modelClass: 'line.model',
        join: {
          from: 'versions.versionId',
          to: 'lines.versionId'
        }
      }
    }
  }
}

module.exports = VersionModel
