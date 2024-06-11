'use strict'

/**
 * Model for primary_purposes (water.purposes_primary)
 * @module PrimaryPurposeModel
 */

const BaseModel = require('./base.model.js')

class PrimaryPurposeModel extends BaseModel {
  static get tableName () {
    return 'primaryPurposes'
  }
}

module.exports = PrimaryPurposeModel
