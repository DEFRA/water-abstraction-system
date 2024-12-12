'use strict'

/**
 * Model for return_requirement_purposes (water.return_requirement_purposes)
 * @module ReturnRequirementPurposeModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ReturnRequirementPurposeModel extends BaseModel {
  static get tableName() {
    return 'returnRequirementPurposes'
  }

  static get relationMappings() {
    return {
      primaryPurpose: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'primary-purpose.model.js',
        join: {
          from: 'returnRequirementPurposes.primaryPurposeId',
          to: 'primaryPurposes.id'
        }
      },
      purpose: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'purpose.model',
        join: {
          from: 'returnRequirementPurposes.purposeId',
          to: 'purposes.id'
        }
      },
      returnRequirement: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'return-requirement.model',
        join: {
          from: 'returnRequirementPurposes.returnRequirementId',
          to: 'returnRequirements.id'
        }
      },
      secondaryPurpose: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'secondary-purpose.model.js',
        join: {
          from: 'returnRequirementPurposes.secondaryPurposeId',
          to: 'secondaryPurposes.id'
        }
      }
    }
  }
}

module.exports = ReturnRequirementPurposeModel
