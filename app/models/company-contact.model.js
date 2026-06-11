'use strict'

/**
 * Model for company_contacts (crm_v2.company_contacts)
 * @module CompanyContactModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class CompanyContactModel extends BaseModel {
  static get tableName() {
    return 'companyContacts'
  }

  static get relationMappings() {
    return {
      company: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'company.model',
        join: {
          from: 'companyContacts.companyId',
          to: 'companies.id'
        }
      },
      contact: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'contact.model',
        join: {
          from: 'companyContacts.contactId',
          to: 'contacts.id'
        }
      },
      createdByUser: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'user.model',
        join: {
          from: 'companyContacts.createdBy',
          to: 'users.id'
        }
      },
      licenceRole: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence-role.model',
        join: {
          from: 'companyContacts.licenceRoleId',
          to: 'licenceRoles.id'
        }
      },
      updatedByUser: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'user.model',
        join: {
          from: 'companyContacts.updatedBy',
          to: 'users.id'
        }
      }
    }
  }

  /**
   * Maps the `abstractionAlerts` flag and linked licences to the journey string value ('yes', 'some', or 'no')
   *
   * @returns {object} The value and label for the abstraction alert type
   */
  $abstractionAlertType() {
    if (!this.abstractionAlerts) {
      return {
        value: 'no',
        label: 'No'
      }
    }

    if (this.abstractionAlertLicences) {
      return {
        value: 'some',
        label: 'Yes, for some licences'
      }
    }

    return {
      value: 'yes',
      label: 'Yes, for all licences'
    }
  }
}

module.exports = CompanyContactModel
