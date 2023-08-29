'use strict'

/**
 * Model for addresses
 * @module AddressModel
 */

const { Model } = require('objection')

const CrmV2BaseModel = require('./crm-v2-base.model.js')

class AddressModel extends CrmV2BaseModel {
  static get tableName () {
    return 'addresses'
  }

  static get idColumn () {
    return 'addressId'
  }

  static get translations () {
    return [
      { database: 'dateCreated', model: 'createdAt' },
      { database: 'dateUpdated', model: 'updatedAt' }
    ]
  }

  static get relationMappings () {
    return {
      invoiceAccountAddresses: {
        relation: Model.HasManyRelation,
        modelClass: 'invoice-account-address.model',
        join: {
          from: 'addresses.addressId',
          to: 'invoiceAccountAddresses.addressId'
        }
      }
    }
  }
}

module.exports = AddressModel
