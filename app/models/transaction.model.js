/**
 * Model for transactions (water.billing_transactions)
 * @module TransactionModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'

class TransactionModel extends BaseModel {
  static get tableName() {
    return 'transactions'
  }

  static get relationMappings() {
    return {
      chargeReference: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'charge-reference.model',
        join: {
          from: 'transactions.chargeReferenceId',
          to: 'chargeReferences.id'
        }
      },
      billLicence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'bill-licence.model',
        join: {
          from: 'transactions.billLicenceId',
          to: 'billLicences.id'
        }
      }
    }
  }

  // Defining which fields contain json allows us to insert an object without needing to stringify it first
  static get jsonAttributes() {
    return ['abstractionPeriod', 'grossValuesCalculated', 'metadata', 'purposes']
  }
}

export default TransactionModel
