'use strict'

/**
 * Model for return_requirements (water.return_requirements)
 * @module ReturnRequirementModel
 */

const BaseModel = require('./base.model.js')

class ReturnRequirementModel extends BaseModel {
  static get tableName () {
    return 'returnRequirements'
  }
}

module.exports = ReturnRequirementModel
