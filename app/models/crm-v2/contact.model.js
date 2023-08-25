'use strict'

/**
 * Model for contacts
 * @module ContactModel
 */

const { Model } = require('objection')

const CrmV2BaseModel = require('./crm-v2-base.model.js')

class ContactModel extends CrmV2BaseModel {
  static get tableName () {
    return 'contacts'
  }

  static get idColumn () {
    return 'contactId'
  }

  static get translations () {
    return [
      { database: 'dateCreated', model: 'createdAt' },
      { database: 'dateUpdated', model: 'updatedAt' }
    ]
  }

  static get relationMappings () {
    return {
      invoiceAccountAddresses: {
        relation: Model.HasManyRelation,
        modelClass: 'invoice-account-address.model',
        join: {
          from: 'contacts.contactId',
          to: 'invoiceAccountAddresses.contactId'
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
   * Along the way we learnt the following about `crm_v2.contacts`
   *
   * ### NALD
   * - `contactType` is always null
   * - `department` is always null
   * - `middleInitials` is always null
   * - `suffix` is always null
   * - `lastName` is always set
   * - `externalId` is always set
   *
   * ### WRLS
   * - `contactType` is always set
   * - `initials` is always null
   * - `externalId` is always null
   * - if `middleInitials` is set then `firstName` is always set
   * - a 'person' always has `firstName` and `lastName` set
   * - a 'person' can have `department` populated
   * - a 'department' will only have `department` populated
   * - as of 2023-08-01 there were 6 contacts with `suffix` populated out of 42,827 (1,621 WRLS)
   *
   * @returns {String} The name for the contact derived from its various parts
   */
  $name () {
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

    const onlyPopulatedNameParts = allNameParts.filter((item) => item)

    return onlyPopulatedNameParts.join(' ')
  }

  _determineInitials () {
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
