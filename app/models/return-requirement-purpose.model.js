/**
 * Model for return_requirement_purposes (water.return_requirement_purposes)
 * @module ReturnRequirementPurposeModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import PrimaryPurposeModel from './primary-purpose.model.js'
import PurposeModel from './purpose.model.js'
import ReturnRequirementModel from './return-requirement.model.js'
import SecondaryPurposeModel from './secondary-purpose.model.js'

export default class ReturnRequirementPurposeModel extends BaseModel {
  static get tableName() {
    return 'returnRequirementPurposes'
  }

  static get relationMappings() {
    return {
      primaryPurpose: {
        relation: Model.BelongsToOneRelation,
        modelClass: PrimaryPurposeModel,
        join: {
          from: 'returnRequirementPurposes.primaryPurposeId',
          to: 'primaryPurposes.id'
        }
      },
      purpose: {
        relation: Model.BelongsToOneRelation,
        modelClass: PurposeModel,
        join: {
          from: 'returnRequirementPurposes.purposeId',
          to: 'purposes.id'
        }
      },
      returnRequirement: {
        relation: Model.BelongsToOneRelation,
        modelClass: ReturnRequirementModel,
        join: {
          from: 'returnRequirementPurposes.returnRequirementId',
          to: 'returnRequirements.id'
        }
      },
      secondaryPurpose: {
        relation: Model.BelongsToOneRelation,
        modelClass: SecondaryPurposeModel,
        join: {
          from: 'returnRequirementPurposes.secondaryPurposeId',
          to: 'secondaryPurposes.id'
        }
      }
    }
  }
}
