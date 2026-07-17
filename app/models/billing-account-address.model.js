/**
 * Model for billing_account_addresses (crm_v2.invoice_account_addresses)
 * @module BillingAccountAddressModel
 */

import { Model } from 'objection'

import AddressModel from './address.model.js'
import BaseModel from './base.model.js'
import BillingAccountModel from './billing-account.model.js'
import CompanyModel from './company.model.js'
import ContactModel from './contact.model.js'

export default class BillingAccountAddressModel extends BaseModel {
  static get tableName() {
    return 'billingAccountAddresses'
  }

  static get relationMappings() {
    return {
      address: {
        relation: Model.BelongsToOneRelation,
        modelClass: AddressModel,
        join: {
          from: 'billingAccountAddresses.addressId',
          to: 'addresses.id'
        }
      },
      billingAccount: {
        relation: Model.BelongsToOneRelation,
        modelClass: BillingAccountModel,
        join: {
          from: 'billingAccountAddresses.billingAccountId',
          to: 'billingAccounts.id'
        }
      },
      company: {
        relation: Model.BelongsToOneRelation,
        modelClass: CompanyModel,
        join: {
          from: 'billingAccountAddresses.companyId',
          to: 'companies.id'
        }
      },
      contact: {
        relation: Model.BelongsToOneRelation,
        modelClass: ContactModel,
        join: {
          from: 'billingAccountAddresses.contactId',
          to: 'contacts.id'
        }
      }
    }
  }
}
