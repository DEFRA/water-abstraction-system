'use strict'

/**
 * Model for company_addresses (crm_v2.company_addresses)
 * @module CompanyAddressModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class CompanyAddressModel extends BaseModel {
  static get tableName() {
    return 'companyAddresses'
  }

  static get relationMappings() {
    return {
      address: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'address.model',
        join: {
          from: 'companyAddresses.addressId',
          to: 'addresses.id'
        }
      },
      company: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'company.model',
        join: {
          from: 'companyAddresses.companyId',
          to: 'companies.id'
        }
      },
      licenceRole: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence-role.model',
        join: {
          from: 'companyAddresses.licenceRoleId',
          to: 'licenceRoles.id'
        }
      }
    }
  }
}

module.exports = CompanyAddressModel
