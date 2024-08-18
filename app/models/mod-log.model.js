'use strict'

/**
 * Model for mod log (water.mod_logs)
 * @module ModLogModel
 */

const BaseModel = require('./base.model.js')

class ModLogModel extends BaseModel {
  static get tableName () {
    return 'modLogs'
  }
}

module.exports = ModLogModel
