/**
 * @module EmptyLicenceSeeder
 */

import LicenceDocumentHeaderHelper from 'water-abstraction-engine/test/helpers/licence-document-header.helper.js'
import LicenceDocumentHelper from 'water-abstraction-engine/test/helpers/licence-document.helper.js'
import LicenceHelper from 'water-abstraction-engine/test/helpers/licence.helper.js'
import RegionHelper from 'water-abstraction-engine/test/helpers/region.helper.js'
import { generateLicenceRef } from 'water-abstraction-engine/test/generators.js'

/**
 * Adds a licence
 *
 * A licence has a unique licence reference, this is used by the licence, licence document, and licence document header tables
 *
 * @param {string} [existingLicenceRef] - The licence ref to use for the licence
 * @param {string} [existingRegionId] - The region id to use for the licence (defaults to anglian)
 * @param {Date} [expiredDate] - The date the licence expires
 *
 * @returns {Promise<object>} an object containing all records related to a licence
 */
export async function seed(existingLicenceRef = null, existingRegionId = null, expiredDate = null) {
  // Set the defaults
  const regionId = existingRegionId ?? RegionHelper.select().id
  const licenceRef = existingLicenceRef ?? generateLicenceRef()

  const licence = await LicenceHelper.add({
    licenceRef,
    regionId,
    expiredDate
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
