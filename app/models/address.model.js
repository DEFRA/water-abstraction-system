'use strict'

/**
 * Model for addresses (crm_v2.addresses)
 * @module AddressModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class AddressModel extends BaseModel {
  static get tableName() {
    return 'addresses'
  }

  static get relationMappings() {
    return {
      billingAccountAddresses: {
        relation: Model.HasManyRelation,
        modelClass: 'billing-account-address.model',
        join: {
          from: 'addresses.id',
          to: 'billingAccountAddresses.addressId'
        }
      },
      companyAddresses: {
        relation: Model.HasManyRelation,
        modelClass: 'company-address.model',
        join: {
          from: 'addresses.id',
          to: 'companyAddresses.addressId'
        }
      },
      licenceDocumentRoles: {
        relation: Model.HasManyRelation,
        modelClass: 'licence-document-role.model',
        join: {
          from: 'addresses.id',
          to: 'licenceDocumentRoles.addressId'
        }
      }
    }
  }
}

module.exports = AddressModel
