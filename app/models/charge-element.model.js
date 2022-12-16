'use strict'

/**
 * Model for water.charge_elements
 * @module ChargeElementModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ChargeElementModel extends BaseModel {
  static get tableName () {
    return 'water.charge_elements'
  }

  static get relationMappings () {
    return {
      chargeVersion: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'charge-version.model',
        join: {
          from: 'water.charge_elements.charge_version_id',
          to: 'water.charge_versions.charge_version_id'
        }
      },
      billingChargeCategory: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'billing-charge-category.model',
        join: {
          from: 'water.charge_elements.billing_charge_category_id',
          to: 'water.billing_charge_categories.billing_charge_category_id'
        }
      },
      chargePurpose: {
        relation: Model.HasManyRelation,
        modelClass: 'charge-purpose.model',
        join: {
          from: 'water.charge_elements.charge_element_id',
          to: 'water.charge_purposes.charge_element_id'
        }
      }
    }
  }
}

module.exports = ChargeElementModel
