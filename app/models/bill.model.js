/**
 * Model for bills (water.billing_invoices)
 * @module BillModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import BillLicenceModel from './bill-licence.model.js'
import BillRunModel from './bill-run.model.js'
import BillingAccountModel from './billing-account.model.js'

export default class BillModel extends BaseModel {
  static get tableName() {
    return 'bills'
  }

  static get relationMappings() {
    return {
      billingAccount: {
        relation: Model.BelongsToOneRelation,
        modelClass: BillingAccountModel,
        join: {
          from: 'bills.billingAccountId',
          to: 'billingAccounts.id'
        }
      },
      billRun: {
        relation: Model.BelongsToOneRelation,
        modelClass: BillRunModel,
        join: {
          from: 'bills.billRunId',
          to: 'billRuns.id'
        }
      },
      billLicences: {
        relation: Model.HasManyRelation,
        modelClass: BillLicenceModel,
        join: {
          from: 'bills.id',
          to: 'billLicences.billId'
        }
      }
    }
  }
}
