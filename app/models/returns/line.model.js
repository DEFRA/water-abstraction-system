'use strict'

/**
 * Model for line
 * @module LineModel
 */

const ReturnsBaseModel = require('./returns-base.model.js')

class LineModel extends ReturnsBaseModel {
  static get tableName () {
    return 'lines'
  }

  static get idColumn () {
    return 'lineId'
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

module.exports = LineModel
