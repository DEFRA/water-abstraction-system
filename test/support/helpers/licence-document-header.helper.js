'use strict'

/**
 * @module LicenceDocumentHelper
 */

const { generateRandomInteger, generateUUID } = require('../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('./licence.helper.js')
const LicenceDocumentHeaderModel = require('../../../app/models/licence-document-header.model.js')

/**
 * Add a new licence document header
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `regimeEntityId` - [random UUID]
 * - `naldId` - [randomly generated - 105175]
 * - `licenceRef` - [randomly generated - 01/123]
 * - `metadata` - [object intended to be persisted] as JSON]
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:LicenceDocumentHeaderModel>} The instance of the newly created record
 */
async function add(data = {}) {
  const insertData = defaults(data)

  return LicenceDocumentHeaderModel.query()
    .insert({ ...insertData })
    .returning('*')
}

/**
 * Returns the defaults used
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {object} - Returns the set defaults with the override data spread
 */
function defaults(data = {}) {
  const defaults = {
    regimeEntityId: generateUUID(),
    naldId: generateRandomInteger(1000, 199999),
    licenceRef: generateLicenceRef(),
    metadata: _metadata()
  }

  return {
    ...defaults,
    ...data
  }
}

function _metadata() {
  return {
    Town: 'BRISTOL',
    County: 'AVON',
    Name: 'GUPTA',
    Country: '',
    Expires: null,
    Forename: 'AMARA',
    Initials: 'A',
    Modified: '20080327',
    Postcode: 'BS1 5AH',
    contacts: [
      {
        name: 'GUPTA',
        role: 'Licence holder',
        town: 'BRISTOL',
        type: 'Person',
        county: 'AVON',
        country: null,
        forename: 'AMARA',
        initials: 'A',
        postcode: 'BS1 5AH',
        salutation: null,
        addressLine1: 'ENVIRONMENT AGENCY',
        addressLine2: 'HORIZON HOUSE',
        addressLine3: 'DEANERY ROAD',
        addressLine4: null
      }
    ],
    isCurrent: true,
    isSummer: true,
    Salutation: '',
    AddressLine1: 'ENVIRONMENT AGENCY',
    AddressLine2: 'HORIZON HOUSE',
    AddressLine3: 'DEANERY ROAD',
    AddressLine4: ''
  }
}

module.exports = {
  add,
  defaults
}
