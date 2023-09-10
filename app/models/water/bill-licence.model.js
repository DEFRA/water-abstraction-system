'use strict'

/**
 * Model for billing_invoice_licences
 * @module BillLicenceModel
 */

const { Model } = require('objection')

const WaterBaseModel = require('./water-base.model.js')

class BillLicenceModel extends WaterBaseModel {
  static get tableName () {
    return 'billingInvoiceLicences'
  }

  static get idColumn () {
    return 'billingInvoiceLicenceId'
  }

  static get translations () {
    return [
      { database: 'dateCreated', model: 'createdAt' },
      { database: 'dateUpdated', model: 'updatedAt' }
    ]
  }

  static get relationMappings () {
    return {
      bill: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'bill.model',
        join: {
          from: 'billingInvoiceLicences.billingInvoiceId',
          to: 'billingInvoices.billingInvoiceId'
        }
      },
      billingTransactions: {
        relation: Model.HasManyRelation,
        modelClass: 'billing-transaction.model',
        join: {
          from: 'billingInvoiceLicences.billingInvoiceLicenceId',
          to: 'billingTransactions.billingInvoiceLicenceId'
        }
      },
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'billingInvoiceLicences.licenceId',
          to: 'licences.licenceId'
        }
      }
    }
  }
}

module.exports = BillLicenceModel
