'use strict'

/**
 * Model for return_requirement_points (water.return_requirement_points)
 * @module ReturnRequirementPointModel
 */

const BaseModel = require('./base.model.js')

class ReturnRequirementPointModel extends BaseModel {
  static get tableName () {
    return 'returnRequirementPoints'
  }
}

module.exports = ReturnRequirementPointModel
