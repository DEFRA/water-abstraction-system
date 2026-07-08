/**
 * Model for charge_categories (water.billing_charge_categories)
 * @module ChargeCategoryModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import ChargeReferenceModel from './charge-reference.model.js'

class ChargeCategoryModel extends BaseModel {
  static get tableName() {
    return 'chargeCategories'
  }

  static get relationMappings() {
    return {
      chargeReferences: {
        relation: Model.HasManyRelation,
        modelClass: ChargeReferenceModel,
        join: {
          from: 'chargeCategories.id',
          to: 'chargeReferences.chargeCategoryId'
        }
      }
    }
  }
}

export default ChargeCategoryModel
