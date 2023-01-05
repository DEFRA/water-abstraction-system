'use strict'

/**
 * Model for billingChargeCategories
 * @module BillingChargeCategoryModel
 */

const { Model } = require('objection')

const WaterBaseModel = require('./water-base.model.js')

class BillingChargeCategoryModel extends WaterBaseModel {
  static get tableName () {
    return 'billingChargeCategories'
  }

  static get idColumn () {
    return 'billingChargeCategoryId'
  }

  static get relationMappings () {
    return {
      chargeElements: {
        relation: Model.HasManyRelation,
        modelClass: 'charge-element.model',
        join: {
          from: 'billingChargeCategories.billingChargeCategoryId',
          to: 'chargeElements.billingChargeCategoryId'
        }
      }
    }
  }
}

module.exports = BillingChargeCategoryModel
