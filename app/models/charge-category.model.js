/**
 * Model for charge_categories (water.billing_charge_categories)
 * @module ChargeCategoryModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'

class ChargeCategoryModel extends BaseModel {
  static get tableName() {
    return 'chargeCategories'
  }

  static get relationMappings() {
    return {
      chargeReferences: {
        relation: Model.HasManyRelation,
        modelClass: 'charge-reference.model',
        join: {
          from: 'chargeCategories.id',
          to: 'chargeReferences.chargeCategoryId'
        }
      }
    }
  }
}

export default ChargeCategoryModel
