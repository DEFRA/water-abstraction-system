/**
 * Model for secondary_purposes (water.purposes_secondary)
 * @module SecondaryPurposeModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'

class SecondaryPurposeModel extends BaseModel {
  static get tableName() {
    return 'secondaryPurposes'
  }

  static get relationMappings() {
    return {
      licenceVersionPurposes: {
        relation: Model.HasManyRelation,
        modelClass: 'licence-version-purpose.model',
        join: {
          from: 'secondaryPurposes.id',
          to: 'licenceVersionPurposes.secondaryPurposeId'
        }
      },
      returnRequirementPurposes: {
        relation: Model.HasManyRelation,
        modelClass: 'return-requirement-purpose.model',
        join: {
          from: 'secondaryPurposes.id',
          to: 'returnRequirementPurposes.secondaryPurposeId'
        }
      }
    }
  }
}

export default SecondaryPurposeModel
