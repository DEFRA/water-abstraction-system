'use strict'

/**
 * Model for version
 * @module VersionModel
 */

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
}

module.exports = VersionModel
