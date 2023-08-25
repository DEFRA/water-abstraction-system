'use strict'

/**
 * Model for invoiceAccountAddresses
 * @module InvoiceAccountAddressModel
 */

const CrmV2BaseModel = require('./crm-v2-base.model.js')

class InvoiceAccountAddressModel extends CrmV2BaseModel {
  static get tableName () {
    return 'invoiceAccountAddresses'
  }

  static get idColumn () {
    return 'invoiceAccountAddressId'
  }

  static get translations () {
    return [
      { database: 'dateCreated', model: 'createdAt' },
      { database: 'dateUpdated', model: 'updatedAt' }
    ]
  }
}

module.exports = InvoiceAccountAddressModel
