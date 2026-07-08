/**
 * Model for purposes (water.purposes_uses)
 * @module PurposeModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import ChargeElementModel from './charge-element.model.js'
import ChargeReferenceModel from './charge-reference.model.js'
import LicenceVersionPurposeModel from './licence-version-purpose.model.js'
import ReturnRequirementPurposeModel from './return-requirement-purpose.model.js'

class PurposeModel extends BaseModel {
  static get tableName() {
    return 'purposes'
  }

  static get relationMappings() {
    return {
      chargeElements: {
        relation: Model.HasManyRelation,
        modelClass: ChargeElementModel,
        join: {
          from: 'purposes.id',
          to: 'chargeElements.purposeId'
        }
      },
      chargeReferences: {
        relation: Model.HasManyRelation,
        modelClass: ChargeReferenceModel,
        join: {
          from: 'purposes.id',
          to: 'chargeReferences.purposeId'
        }
      },
      licenceVersionPurposes: {
        relation: Model.HasManyRelation,
        modelClass: LicenceVersionPurposeModel,
        join: {
          from: 'purposes.id',
          to: 'licenceVersionPurposes.purposeId'
        }
      },
      returnRequirementPurposes: {
        relation: Model.HasManyRelation,
        modelClass: ReturnRequirementPurposeModel,
        join: {
          from: 'purposes.id',
          to: 'returnRequirementPurposes.purposeId'
        }
      }
    }
  }
}

export default PurposeModel
