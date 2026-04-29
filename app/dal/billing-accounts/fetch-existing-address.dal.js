'use strict'

/**
 * Fetches the address for the provided address id.
 * @module FetchExistingAddress
 */

const AddressModel = require('../../models/address.model.js')

/**
 * Fetches the address for the provided address id.
 *
 * When changing the addess for a billing account and the user has chosen an exisitng address this service will return that
 * address for display on the screen.
 *
 * @param {string} addressId - The UUID of the address.
 *
 * @returns {Promise<object>} An address object.
 */
async function go(addressId) {
  return AddressModel.query()
    .select(['addresses.id', 'address1', 'address2', 'address3', 'address4', 'address5', 'address6', 'postcode'])
    .findById(addressId)
}

module.exports = {
  go
}
