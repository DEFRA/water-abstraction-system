/**
 * Model for addresses (crm_v2.addresses)
 * @module AddressModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import BillingAccountAddressModel from './billing-account-address.model.js'
import CompanyAddressModel from './company-address.model.js'
import LicenceDocumentRoleModel from './licence-document-role.model.js'
import LicenceVersionModel from './licence-version.model.js'

export default class AddressModel extends BaseModel {
  static get tableName() {
    return 'addresses'
  }

  static get relationMappings() {
    return {
      billingAccountAddresses: {
        relation: Model.HasManyRelation,
        modelClass: BillingAccountAddressModel,
        join: {
          from: 'addresses.id',
          to: 'billingAccountAddresses.addressId'
        }
      },
      companyAddresses: {
        relation: Model.HasManyRelation,
        modelClass: CompanyAddressModel,
        join: {
          from: 'addresses.id',
          to: 'companyAddresses.addressId'
        }
      },
      licenceDocumentRoles: {
        relation: Model.HasManyRelation,
        modelClass: LicenceDocumentRoleModel,
        join: {
          from: 'addresses.id',
          to: 'licenceDocumentRoles.addressId'
        }
      },
      licenceVersions: {
        relation: Model.HasManyRelation,
        modelClass: LicenceVersionModel,
        join: {
          from: 'addresses.id',
          to: 'licenceVersions.addressId'
        }
      }
    }
  }
}
