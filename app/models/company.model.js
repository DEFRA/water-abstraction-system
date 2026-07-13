/**
 * Model for companies (crm_v2.companies)
 * @module CompanyModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import BillingAccountAddressModel from './billing-account-address.model.js'
import BillingAccountModel from './billing-account.model.js'
import CompanyAddressModel from './company-address.model.js'
import CompanyContactModel from './company-contact.model.js'
import LicenceDocumentRoleModel from './licence-document-role.model.js'
import LicenceVersionModel from './licence-version.model.js'
import RegionModel from './region.model.js'

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
export default class CompanyModel extends BaseModel {
  static get tableName() {
    return 'companies'
  }

  static get relationMappings() {
    return {
      billingAccountAddresses: {
        relation: Model.HasManyRelation,
        modelClass: BillingAccountAddressModel,
        join: {
          from: 'companies.id',
          to: 'billingAccountAddresses.companyId'
        }
      },
      billingAccounts: {
        relation: Model.HasManyRelation,
        modelClass: BillingAccountModel,
        join: {
          from: 'companies.id',
          to: 'billingAccounts.companyId'
        }
      },
      companyAddresses: {
        relation: Model.HasManyRelation,
        modelClass: CompanyAddressModel,
        join: {
          from: 'companies.id',
          to: 'companyAddresses.companyId'
        }
      },
      companyContacts: {
        relation: Model.HasManyRelation,
        modelClass: CompanyContactModel,
        join: {
          from: 'companies.id',
          to: 'companyContacts.companyId'
        }
      },
      licenceDocumentRoles: {
        relation: Model.HasManyRelation,
        modelClass: LicenceDocumentRoleModel,
        join: {
          from: 'companies.id',
          to: 'licenceDocumentRoles.companyId'
        }
      },
      licenceVersions: {
        relation: Model.HasManyRelation,
        modelClass: LicenceVersionModel,
        join: {
          from: 'companies.id',
          to: 'licenceVersions.companyId'
        }
      },
      region: {
        relation: Model.BelongsToOneRelation,
        modelClass: RegionModel,
        join: {
          from: 'companies.regionId',
          to: 'regions.id'
        }
      }
    }
  }
}
