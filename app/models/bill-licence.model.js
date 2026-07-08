/**
 * Model for bill_licences (water.billing_invoice_licences)
 * @module BillLicenceModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import BillModel from './bill.model.js'
import LicenceModel from './licence.model.js'
import TransactionModel from './transaction.model.js'

export default class BillLicenceModel extends BaseModel {
  static get tableName() {
    return 'billLicences'
  }

  static get relationMappings() {
    return {
      bill: {
        relation: Model.BelongsToOneRelation,
        modelClass: BillModel,
        join: {
          from: 'billLicences.billId',
          to: 'bills.id'
        }
      },
      transactions: {
        relation: Model.HasManyRelation,
        modelClass: TransactionModel,
        join: {
          from: 'billLicences.id',
          to: 'transactions.billLicenceId'
        }
      },
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: LicenceModel,
        join: {
          from: 'billLicences.licenceId',
          to: 'licences.id'
        }
      }
    }
  }
}