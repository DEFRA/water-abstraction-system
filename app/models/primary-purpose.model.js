/**
 * Model for primary_purposes (water.purposes_primary)
 * @module PrimaryPurposeModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import LicenceVersionPurposeModel from './licence-version-purpose.model.js'
import ReturnRequirementPurposeModel from './return-requirement-purpose.model.js'

export default class PrimaryPurposeModel extends BaseModel {
  static get tableName() {
    return 'primaryPurposes'
  }

  static get relationMappings() {
    return {
      licenceVersionPurposes: {
        relation: Model.HasManyRelation,
        modelClass: LicenceVersionPurposeModel,
        join: {
          from: 'primaryPurposes.id',
          to: 'licenceVersionPurposes.primaryPurposeId'
        }
      },
      returnRequirementPurposes: {
        relation: Model.HasManyRelation,
        modelClass: ReturnRequirementPurposeModel,
        join: {
          from: 'primaryPurposes.id',
          to: 'returnRequirementPurposes.primaryPurposeId'
        }
      }
    }
  }
}
