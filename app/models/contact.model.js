'use strict'

/**
 * Model for contacts (crm_v2.contacts)
 * @module ContactModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

/**
 * Objection model that represents a `contact` in the `crm_v2.contacts` table
 *
 * ### Notes
 *
 * For all records `lastName` is always set
 *
 * When the `dataSource` is 'nald'
 *
 * - `contactType` is always null
 * - `department` is always null
 * - `middleInitials` is always null
 * - `suffix` is always null
 * - `externalId` is always set
 *
 * When the `dataSource` is 'wrls'
 *
 * - `contactType` is always set
 * - `initials` is always null
 * - `externalId` is always null
 * - if `middleInitials` is set then `firstName` is always set
 * - a 'person' always has `firstName` and `lastName` set
 * - a 'person' can have `department` populated
 * - a 'department' will only have `department` populated
 * - as of 2023-08-01 there were 6 contacts with `suffix` populated out of 42,827 (1,621 WRLS)
 *
 */
class ContactModel extends BaseModel {
  static get tableName() {
    return 'contacts'
  }

  static get relationMappings() {
    return {
      billingAccountAddresses: {
        relation: Model.HasManyRelation,
        modelClass: 'billing-account-address.model',
        join: {
          from: 'contacts.id',
          to: 'billingAccountAddresses.contactId'
        }
      },
      companyContacts: {
        relation: Model.HasManyRelation,
        modelClass: 'company-contact.model',
        join: {
          from: 'contacts.id',
          to: 'companyContacts.contactId'
        }
      },
      licenceDocumentRoles: {
        relation: Model.HasManyRelation,
        modelClass: 'licence-document-role.model',
        join: {
          from: 'contacts.id',
          to: 'licenceDocumentRoles.contactId'
        }
      }
    }
  }

  /**
   * Returns the name for the contact derived from its various parts
   *
   * We have 2 sources for contact data; the import from NALD and those directly entered into the service. For reasons
   * only the previous team will know we have not been consistent across them. What fields are populated depends on
   * the data source. Added to that 'contacts' entered via the service are used to hold both departments and people.
   *
   * We have to send a derived name when sending customer changes to the Charging Module API as it accepts only a
   * single `customerName` value. What we have implemented here replicates what the legacy code was doing to derive
   * what that name should be.
   *
   * @returns {string} The name for the contact derived from its various parts
   */
  $name() {
    if (this.contactType === 'department') {
      return this.department
    }

    const initials = this._determineInitials()

    const allNameParts = [
      this.salutation,
      initials || this.firstName, // if we have initials use them else use firstName
      this.lastName,
      this.suffix
    ]

    const onlyPopulatedNameParts = allNameParts.filter((item) => {
      return item
    })

    return onlyPopulatedNameParts.join(' ')
  }

  _determineInitials() {
    if (this.initials) {
      return this.initials
    }

    if (this.middleInitials) {
      return `${this.firstName.slice(0, 1)} ${this.middleInitials}`
    }

    return null
  }
}

module.exports = ContactModel
