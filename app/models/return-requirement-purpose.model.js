'use strict'

/**
 * Model for return_requirement_purposes (water.return_requirement_purposes)
 * @module ReturnRequirementPurposeModel
 */

const BaseModel = require('./base.model.js')

class ReturnRequirementPurposeModel extends BaseModel {
  static get tableName () {
    return 'returnRequirementPurposes'
  }
}

module.exports = ReturnRequirementPurposeModel
