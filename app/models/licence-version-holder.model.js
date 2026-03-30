'use strict'

/**
 * Model for licence_version_holders (water.licence_version_holders)
 * @module LicenceVersionHolderModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

const NotifyAddressPresenter = require('../presenters/notices/setup/notify-address.presenter.js')

class LicenceVersionHolderModel extends BaseModel {
  static get tableName() {
    return 'licenceVersionHolders'
  }

  static get relationMappings() {
    return {
      address: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'address.model',
        join: {
          from: 'licenceVersionHolders.addressId',
          to: 'addresses.id'
        }
      },
      company: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'company.model',
        join: {
          from: 'licenceVersionHolders.companyId',
          to: 'companies.id'
        }
      },
      licenceVersion: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence-version.model',
        join: {
          from: 'licenceVersionHolders.licenceVersionId',
          to: 'licenceVersions.id'
        }
      }
    }
  }

  /**
   * Determine 'just' the address lines for the licence version holder
   *
   * This uses the existing logic in `NotifyAddressPresenter`. To ensure the address returned is only 6 lines long,
   * blanks are removed, and the country is correctly set.
   *
   * > GOV.UK Notify sets the requirements for what a 'valid' address is for us. It has a limit of 7 address lines, but
   * the first covers the name, which we always send. That leaves 6 for the actual address lines.
   *
   * We generate a 'contact' object from the details in this instance so `NotifyAddressPresenter` can do 'its thing!'.
   * We then drop the first address line, which will be the name, and return 'just' the address lines.
   *
   * @returns {string[]} just the address lines for the licence version holder
   */
  $address() {
    const thisContact = _contact(this)

    // Contacts using the legacy contact model need to be converted to the updated format
    const contact = {
      name: thisContact.derivedName ?? '',
      address1: thisContact.addressLine1 ?? '',
      address2: thisContact.addressLine2 ?? '',
      address3: thisContact.addressLine3 ?? '',
      address4: thisContact.addressLine4 ?? '',
      address5: thisContact.town ?? '',
      address6: thisContact.county ?? '',
      postcode: thisContact.postcode ?? '',
      country: thisContact.country ?? ''
    }

    const address = NotifyAddressPresenter.go(contact)

    const addressLines = Object.values(address)

    const addressLinesNoName = addressLines.slice(1)

    return addressLinesNoName
  }
}

function _contact(licenceVersionHolder) {
  return {
    addressLine1: licenceVersionHolder?.addressLine1,
    addressLine2: licenceVersionHolder?.addressLine2,
    addressLine3: licenceVersionHolder?.addressLine3,
    addressLine4: licenceVersionHolder?.addressLine4,
    country: licenceVersionHolder?.country,
    county: licenceVersionHolder?.county,
    name: licenceVersionHolder?.derivedName,
    postcode: licenceVersionHolder?.postcode,
    town: licenceVersionHolder?.town
  }
}

module.exports = LicenceVersionHolderModel
