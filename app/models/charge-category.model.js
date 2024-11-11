'use strict'

/**
 * Model for charge_categories (water.billing_charge_categories)
 * @module ChargeCategoryModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

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

module.exports = ChargeCategoryModel
