'use strict'

/**
 * Model for licence_version_holders (water.licence_version_holders)
 * @module LicenceVersionHolderModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

const NotifyAddressPresenter = require('../presenters/notices/setup/notify-address.presenter.js')
const { contactName } = require('../presenters/crm.presenter.js')

class LicenceVersionHolderModel extends BaseModel {
  static get tableName() {
    return 'licenceVersionHolders'
  }

  static get relationMappings() {
    return {
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
   * Determine the address lines for the licence version holder
   *
   * This uses the existing logic in the address presenter.
   *
   * We need to format part of the object to use the 'contactName' function.
   *
   * We format the response from the address presenter into an array.
   *
   * The address presenter returns the 'contactName' as the first element.
   *
   * We do not want to show this in the address, so we remove it before returning the array of address lines.
   *
   * @returns {string[]} the address lines for the licence version hodler
   */
  $address() {
    const licenceVersionHolder = _formatLicenceVersionHolder(this)

    const address = NotifyAddressPresenter.go(licenceVersionHolder)

    const addressLines = Object.values(address)

    const addressLinesNoName = addressLines.slice(1)

    return addressLinesNoName
  }

  /**
   * Determine the licence version hodler name
   *
   * This uses the existing logic in the crm presenter.
   *
   * We need to format part of the object to use the 'contactName' function.
   *
   * @returns {string} the licence version hodler name
   */
  $name() {
    const licenceVersionHolder = _formatLicenceVersionHolder(this)

    return contactName(licenceVersionHolder)
  }
}

function _formatLicenceVersionHolder(licenceVersionHolder) {
  const { holderType, ...contact } = licenceVersionHolder

  contact.type = holderType

  return contact
}

module.exports = LicenceVersionHolderModel
