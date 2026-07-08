/**
 * Model for charge_elements (water.charge_purposes)
 * @module ChargeElementModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import ChargeReferenceModel from './charge-reference.model.js'
import PurposeModel from './purpose.model.js'
import ReviewChargeElementModel from './review-charge-element.model.js'

class ChargeElementModel extends BaseModel {
  static get tableName() {
    return 'chargeElements'
  }

  static get relationMappings() {
    return {
      chargeReference: {
        relation: Model.BelongsToOneRelation,
        modelClass: ChargeReferenceModel,
        join: {
          from: 'chargeElements.chargeReferenceId',
          to: 'chargeReferences.id'
        }
      },
      purpose: {
        relation: Model.BelongsToOneRelation,
        modelClass: PurposeModel,
        join: {
          from: 'chargeElements.purposeId',
          to: 'purposes.id'
        }
      },
      reviewChargeElements: {
        relation: Model.HasManyRelation,
        modelClass: ReviewChargeElementModel,
        join: {
          from: 'chargeElements.id',
          to: 'reviewChargeElements.chargeElementId'
        }
      }
    }
  }
}

export default ChargeElementModel
