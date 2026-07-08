/**
 * Model for secondary_purposes (water.purposes_secondary)
 * @module SecondaryPurposeModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import LicenceVersionPurposeModel from './licence-version-purpose.model.js'
import ReturnRequirementPurposeModel from './return-requirement-purpose.model.js'

export default class SecondaryPurposeModel extends BaseModel {
  static get tableName() {
    return 'secondaryPurposes'
  }

  static get relationMappings() {
    return {
      licenceVersionPurposes: {
        relation: Model.HasManyRelation,
        modelClass: LicenceVersionPurposeModel,
        join: {
          from: 'secondaryPurposes.id',
          to: 'licenceVersionPurposes.secondaryPurposeId'
        }
      },
      returnRequirementPurposes: {
        relation: Model.HasManyRelation,
        modelClass: ReturnRequirementPurposeModel,
        join: {
          from: 'secondaryPurposes.id',
          to: 'returnRequirementPurposes.secondaryPurposeId'
        }
      }
    }
  }
}