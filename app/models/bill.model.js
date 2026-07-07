/**
 * Model for bills (water.billing_invoices)
 * @module BillModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'

class BillModel extends BaseModel {
  static get tableName() {
    return 'bills'
  }

  static get relationMappings() {
    return {
      billingAccount: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'billing-account.model',
        join: {
          from: 'bills.billingAccountId',
          to: 'billingAccounts.id'
        }
      },
      billRun: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'bill-run.model',
        join: {
          from: 'bills.billRunId',
          to: 'billRuns.id'
        }
      },
      billLicences: {
        relation: Model.HasManyRelation,
        modelClass: 'bill-licence.model',
        join: {
          from: 'bills.id',
          to: 'billLicences.billId'
        }
      }
    }
  }
}

export default BillModel
