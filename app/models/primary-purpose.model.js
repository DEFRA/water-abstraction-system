/**
 * Model for primary_purposes (water.purposes_primary)
 * @module PrimaryPurposeModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'

class PrimaryPurposeModel extends BaseModel {
  static get tableName() {
    return 'primaryPurposes'
  }

  static get relationMappings() {
    return {
      licenceVersionPurposes: {
        relation: Model.HasManyRelation,
        modelClass: 'licence-version-purpose.model',
        join: {
          from: 'primaryPurposes.id',
          to: 'licenceVersionPurposes.primaryPurposeId'
        }
      },
      returnRequirementPurposes: {
        relation: Model.HasManyRelation,
        modelClass: 'return-requirement-purpose.model',
        join: {
          from: 'primaryPurposes.id',
          to: 'returnRequirementPurposes.primaryPurposeId'
        }
      }
    }
  }
}

export default PrimaryPurposeModel
