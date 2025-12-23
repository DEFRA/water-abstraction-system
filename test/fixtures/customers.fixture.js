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
    {
      id: generateUUID(),
      licenceDocument: {
        endDate: null,
        id: generateUUID(),
        licence: LicenceModel.fromJson({
          id: generateUUID(),
          licenceDocumentHeader: {
            id: generateUUID(),
            licenceName: 'Between Two Tyrell'
          },
          licenceRef: generateLicenceRef()
        }),
        startDate: new Date('2022-01-01')
      }
    }
  ]
}

module.exports = {
  customer,
  licences
}
