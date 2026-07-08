/**
 * Model for company_addresses (crm_v2.company_addresses)
 * @module CompanyAddressModel
 */

import { Model } from 'objection'

import BaseModel from './base.model.js'
import AddressModel from './address.model.js'
import CompanyModel from './company.model.js'
import LicenceRoleModel from './licence-role.model.js'

export default class CompanyAddressModel extends BaseModel {
  static get tableName() {
    return 'companyAddresses'
  }

  static get relationMappings() {
    return {
      address: {
        relation: Model.BelongsToOneRelation,
        modelClass: AddressModel,
        join: {
          from: 'companyAddresses.addressId',
          to: 'addresses.id'
        }
      },
      company: {
        relation: Model.BelongsToOneRelation,
        modelClass: CompanyModel,
        join: {
          from: 'companyAddresses.companyId',
          to: 'companies.id'
        }
      },
      licenceRole: {
        relation: Model.BelongsToOneRelation,
        modelClass: LicenceRoleModel,
        join: {
          from: 'companyAddresses.licenceRoleId',
          to: 'licenceRoles.id'
        }
      }
    }
  }
}