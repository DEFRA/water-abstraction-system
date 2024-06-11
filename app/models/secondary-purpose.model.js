'use strict'

/**
 * Model for secondary_purposes (water.purposes_secondary)
 * @module SecondaryPurposeModel
 */

const BaseModel = require('./base.model.js')

class SecondaryPurposeModel extends BaseModel {
  static get tableName () {
    return 'secondaryPurposes'
  }
}

module.exports = SecondaryPurposeModel
