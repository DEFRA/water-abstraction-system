/**
 * Model for licence_version_purpose_condition_types (water.licence_version_purpose_condition_types)
 * @module LicenceVersionPurposeConditionTypeModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import LicenceVersionPurposeConditionModel from './licence-version-purpose-condition.model.js'

class LicenceVersionPurposeConditionTypeModel extends BaseModel {
  static get tableName() {
    return 'licenceVersionPurposeConditionTypes'
  }

  static get relationMappings() {
    return {
      licenceVersionPurposeConditions: {
        relation: Model.HasManyRelation,
        modelClass: LicenceVersionPurposeConditionModel,
        join: {
          from: 'licenceVersionPurposeConditionTypes.id',
          to: 'licenceVersionPurposeConditions.licenceVersionPurposeConditionTypeId'
        }
      }
    }
  }
}

export default LicenceVersionPurposeConditionTypeModel
