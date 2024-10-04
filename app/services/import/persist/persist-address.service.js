'use strict'

/**
 * Creates or updates an address
 * @module PersistAddressService
 */

const AddressModel = require('../../../models/address.model.js')

/**
 * Creates or updates an address
 *
 * @param trx - the current database transaction
 * @param updatedAt
 * @param addresses
 */
async function go (trx, updatedAt, addresses) {
  await _persistAddresses(trx, updatedAt, addresses)
}

async function _persistAddress (trx, updatedAt, address) {
  return AddressModel.query(trx)
    .insert({ ...address, updatedAt })
    .onConflict('externalId')
    .merge([
      'address1',
      'address2',
      'address3',
      'address4',
      'address5',
      'address6',
      'country',
      'postcode',
      'updatedAt'
    ])
}

async function _persistAddresses (trx, updatedAt, addresses) {
  for (const address of addresses) {
    await _persistAddress(trx, updatedAt, address)
  }
}

module.exports = {
  go
}
