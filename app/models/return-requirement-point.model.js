'use strict'

/**
 * Model for ReturnRequirementPoints (water.return_requirement_points)
 * @module ReturnRequirementPoints
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ReturnRequirementPoints extends BaseModel {
  static get tableName () {
    return 'returnRequirementPoints'
  }

  static get relationMappings () {
    return {
      licenceVersion: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence-version.model',
        join: {
          from: 'licenceVersionPurposes.licenceVersionId',
          to: 'licenceVersions.id'
        }
      },
      purpose: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'purpose.model.js',
        join: {
          from: 'licenceVersionPurposes.purposeId',
          to: 'purposes.id'
        }
      }
    }
  }
}

module.exports = ReturnRequirementPoints
