'use strict'

const LicenceModel = require('../../app/models/licence.model.js')
const { generateLicenceRef } = require('../support/helpers/licence.helper.js')
const { generateUUID } = require('../../app/lib/general.lib.js')

/**
 * A representation from the customers 'FetchCustomerService'
 *
 * @returns {object} A customer object
 */
function customer() {
  return {
    id: generateUUID(),
    name: 'Tyrell Corporation'
  }
}

/**
 * A representation from the customers 'FetchLicencesService'
 *
 * @returns {object[]} A array of licences
 */
function licences() {
  return [
    LicenceModel.fromJson({
      endDate: null,
      id: generateUUID(),
      licenceRef: generateLicenceRef(),
      licenceDocumentHeader: {
        id: generateUUID(),
        licenceName: 'Between Two Tyrell'
      },
      startDate: new Date('2022-01-01')
    })
  ]
}

module.exports = {
  customer,
  licences
}
