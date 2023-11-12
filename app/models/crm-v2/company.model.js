'use strict'

/**
 * Model for company
 * @module CompanyModel
 */

const { Model } = require('objection')

const CrmV2BaseModel = require('./crm-v2-base.model.js')

/**
 * Objection model that represents a `company` in the `crm_v2.companies` table
 *
 * ### Notes
 *
 * There is no `dataSource` field in the table. But anything that has `externalId` populated can be assumed to have been
 * imported from NALD and everything else directly entered into WRLS.
 *
 * For all records `name` and `type` are set
 *
 * When the source is 'nald'
 *
 * - `companyNumber` is always null
 * - `organisationType` is always null
 * - `lastHash` is always set
 * - `currentHash` is always set
 * - `externalId` is always set
 *
 * When the source is 'wrls'
 *
 * - `lastHash` is always null
 * - `currentHash` is always null
 * - `externalId` is always null
 * - if `type` is 'organisation' then `companyNumber` is always set
 * - if `type` is 'organisation' then `organisationType` can be null or set
 * - if `type` is 'person' then `companyNumber` is always null
 * - if `type` is 'person' then `organisationType` is always null
 * - as of 2023-08-01 there were 28 companies with `type` set to 'organisation'
 *
 * We currently do not know how `organisationType` gets populated!
 *
 */
class CompanyModel extends CrmV2BaseModel {
  static get tableName () {
    return 'companies'
  }

  static get idColumn () {
    return 'companyId'
  }

  static get translations () {
    return [
      { database: 'dateCreated', model: 'createdAt' },
      { database: 'dateUpdated', model: 'updatedAt' }
    ]
  }

  static get relationMappings () {
    return {
      billingAccountAddresses: {
        relation: Model.HasManyRelation,
        modelClass: 'billing-account-address.model',
        join: {
          from: 'companies.companyId',
          to: 'invoiceAccountAddresses.agentCompanyId'
        }
      },
      billingAccounts: {
        relation: Model.HasManyRelation,
        modelClass: 'billing-account.model',
        join: {
          from: 'companies.companyId',
          to: 'invoiceAccounts.companyId'
        }
      }
    }
  }
}

module.exports = CompanyModel
