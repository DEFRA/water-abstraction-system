'use strict'

/**
 * @module EmptyLicenceSeeder
 */

const LicenceDocumentHeaderHelper = require('../helpers/licence-document-header.helper.js')
const LicenceDocumentHelper = require('../helpers/licence-document.helper.js')
const LicenceHelper = require('../helpers/licence.helper.js')
const RegionHelper = require('../helpers/region.helper.js')
const { generateLicenceRef } = require('../helpers/licence.helper.js')

/**
 * Adds a licence
 *
 * A licence has a unique licence reference, this is used by the licence, licence document, and licence document header tables
 *
 * @param {string} [existingLicenceRef] - The licence ref to use for the licence
 * @param {string} [existingRegionId] - The region id to use for the licence (defaults to anglian)
 *
 * @returns {Promise<object>} an object containing all records related to a licence
 */
async function seed(existingLicenceRef = null, existingRegionId = null) {
  // Set the defaults
  const anglianRegion = RegionHelper.select(0)
  const regionId = existingRegionId ?? anglianRegion.id
  const licenceRef = existingLicenceRef ?? generateLicenceRef()

  const licence = await LicenceHelper.add({
    licenceRef,
    regionId
  })

  const licenceDocument = await LicenceDocumentHelper.add({
    licenceRef
  })

  const licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({
    licenceRef
  })

  return {
    licence,
    licenceDocument,
    licenceDocumentHeader,
    clean: async () => {
      await licence.$query().delete()
      await licenceDocument.$query().delete()
      await licenceDocumentHeader.$query().delete()
    }
  }
}

module.exports = {
  seed
}
