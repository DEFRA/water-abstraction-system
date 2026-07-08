/**
 * Fetches the address data needed for the view '/companies/{id}/address/{addressId}/{role}'
 * @module FetchAddressDal
 */

import AddressModel from '../../models/address.model.js'

/**
 * Fetches the address data needed for the view '/companies/{id}/address/{addressId}/{role}'
 *
 * @param {string} addressId - The address id
 *
 * @returns {Promise<module:AddressModel>} the data needed to populate the view company with address page
 */
export default async function go(addressId) {
  return AddressModel.query()
    .findById(addressId)
    .select(['id', 'address1', 'address2', 'address3', 'address4', 'address5', 'address6', 'country', 'postcode'])
}
