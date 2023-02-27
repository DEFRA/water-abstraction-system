'use strict'

/**
 * Model for invoiceAccounts
 * @module InvoiceAccountModel
 */

const CrmV2BaseModel = require('./crm-v2-base.model.js')

class InvoiceAccountModel extends CrmV2BaseModel {
  static get tableName () {
    return 'invoiceAccounts'
  }

  static get idColumn () {
    return 'invoiceAccountId'
  }

  static get translations () {
    return [
      { database: 'dateCreated', model: 'createdAt' },
      { database: 'dateUpdated', model: 'updatedAt' }
    ]
  }
}

module.exports = InvoiceAccountModel
