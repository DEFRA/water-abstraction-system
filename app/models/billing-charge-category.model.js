'use strict'

/**
 * Model for water.billing_charge_categories
 * @module BillingChargeCategoryModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class BillingChargeCategoryModel extends BaseModel {
  static get tableName () {
    return 'water.billing_charge_categories'
  }

  static get relationMappings () {
    return {
      chargeElement: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'charge-element.model',
        join: {
          from: 'water.billing_charge_categories.billing_charge_category_id',
          to: 'water.charge_elements.billing_charge_category_id'
        }
      }
    }
  }
}

module.exports = BillingChargeCategoryModel
