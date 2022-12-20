'use strict'

/**
 * Model for water.charge_versions
 * @module ChargeVersionModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ChargeVersionModel extends BaseModel {
  static get tableName () {
    return 'water.charge_versions'
  }

  static get idColumn () {
    return 'charge_version_id'
  }

  static get relationMappings () {
    return {
      billingChargeCategory: {
        relation: Model.ManyToManyRelation,
        modelClass: 'billing-charge-category.model',
        join: {
          from: 'water.charge_versions.charge_version_id',
          through: {
            from: 'water.charge_elements.charge_version_id',
            to: 'water.charge_elements.billing_charge_category_id'
          },
          to: 'water.billing_charge_categories.billing_charge_category_id'
        }
      },
      chargePurpose: {
        relation: Model.ManyToManyRelation,
        modelClass: 'charge-purpose.model',
        join: {
          from: 'water.charge_versions.charge_version_id',
          through: {
            from: 'water.charge_elements.charge_version_id',
            to: 'water.charge_elements.charge_element_id'
          },
          to: 'water.charge_purposes.charge_element_id'
        }
      },
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'water.charge_versions.licence_id',
          to: 'water.licences.licence_id'
        }
      },
      chargeElement: {
        relation: Model.HasManyRelation,
        modelClass: 'charge-element.model',
        join: {
          from: 'water.charge_versions.charge_version_id',
          to: 'water.charge_elements.charge_version_id'
        }
      }
    }
  }
}

module.exports = ChargeVersionModel
