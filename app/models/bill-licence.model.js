/**
 * Model for bill_licences (water.billing_invoice_licences)
 * @module BillLicenceModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'

class BillLicenceModel extends BaseModel {
  static get tableName() {
    return 'billLicences'
  }

  static get relationMappings() {
    return {
      bill: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'bill.model',
        join: {
          from: 'billLicences.billId',
          to: 'bills.id'
        }
      },
      transactions: {
        relation: Model.HasManyRelation,
        modelClass: 'transaction.model',
        join: {
          from: 'billLicences.id',
          to: 'transactions.billLicenceId'
        }
      },
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'billLicences.licenceId',
          to: 'licences.id'
        }
      }
    }
  }
}

export default BillLicenceModel
