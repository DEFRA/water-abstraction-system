'use strict'

/**
 * Model for return
 * @module ReturnModel
 */

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
}

module.exports = ReturnModel
