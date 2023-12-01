'use strict'

/**
 * Model for crm_v2.addresses
 * @module AddressModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class AddressModel extends BaseModel {
  static get tableName () {
    return 'addresses'
  }

  static get relationMappings () {
    return {
      billingAccountAddresses: {
        relation: Model.HasManyRelation,
        modelClass: 'billing-account-address.model',
        join: {
          from: 'addresses.id',
          to: 'billingAccountAddresses.addressId'
        }
      }
    }
  }
}

module.exports = AddressModel
