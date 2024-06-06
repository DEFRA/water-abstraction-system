'use strict'

/**
 * Model for return_versions (water.return_versions)
 * @module ReturnVersionModel
 */

const BaseModel = require('./base.model.js')

class ReturnVersionModel extends BaseModel {
  static get tableName () {
    return 'returnVersions'
  }
}

module.exports = ReturnVersionModel
