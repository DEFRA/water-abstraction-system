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
}

module.exports = ReturnModel
