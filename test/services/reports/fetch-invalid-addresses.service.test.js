// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import LicenceDocumentHeaderHelper from 'water-abstraction-engine/test/helpers/licence-document-header.helper.js'
import LicenceHelper from 'water-abstraction-engine/test/helpers/licence.helper.js'
import { tomorrow, yesterday } from 'water-abstraction-engine/test/general.js'

// Thing under test
import FetchInvalidAddressesService from '../../../src/services/reports/fetch-invalid-addresses.service.js'

describe('Reports - Fetch Invalid Addresses service', () => {
  const metadata = {
    contacts: [
      {
        addressLine1: 'ENVIRONMENT AGENCY',
        addressLine2: 'HORIZON HOUSE',
        addressLine3: 'DEANERY ROAD',
        addressLine4: null,
        country: null,
        county: 'AVON',
        postcode: null,
        role: 'Licence holder',
        town: 'BRISTOL'
      }
    ]
  }

  let currentLicenceHolder
  let licenceHolderExpiresTomorrow
  let licenceHolderExpiredYesterday
  let noInvalidAddress
  let returnsToLapsesTomorrow
  let returnsToRevokedTomorrow
  let returnsToSpecialCharacters

  beforeAll(async () => {
    noInvalidAddress = {
      licence: await LicenceHelper.add({ licenceRef: '03/28/01/0164' }),
      licenceDocumentHeader: await LicenceDocumentHeaderHelper.add({ licenceRef: '03/28/01/0164' })
    }

    currentLicenceHolder = {
      licence: await LicenceHelper.add({ licenceRef: '03/28/01/0165' }),
      licenceDocumentHeader: await LicenceDocumentHeaderHelper.add({ licenceRef: '03/28/01/0165', metadata })
    }

    licenceHolderExpiresTomorrow = {
      licence: await LicenceHelper.add({ expiredDate: tomorrow(), licenceRef: '03/28/01/0166' }),
      licenceDocumentHeader: await LicenceDocumentHeaderHelper.add({ licenceRef: '03/28/01/0166', metadata })
    }

    licenceHolderExpiredYesterday = {
      licence: await LicenceHelper.add({ expiredDate: yesterday(), licenceRef: '03/28/01/0167' }),
      licenceDocumentHeader: await LicenceDocumentHeaderHelper.add({ licenceRef: '03/28/01/0167', metadata })
    }

    metadata.contacts[0].role = 'Returns to'

    returnsToLapsesTomorrow = {
      licence: await LicenceHelper.add({ lapsedDate: tomorrow(), licenceRef: '03/28/01/0168' }),
      licenceDocumentHeader: await LicenceDocumentHeaderHelper.add({ licenceRef: '03/28/01/0168', metadata })
    }

    returnsToRevokedTomorrow = {
      licence: await LicenceHelper.add({ licenceRef: '03/28/01/0169', revokedDate: tomorrow() }),
      licenceDocumentHeader: await LicenceDocumentHeaderHelper.add({ licenceRef: '03/28/01/0169', metadata })
    }

    metadata.contacts[0].addressLine2 = '(Facilities) HORIZON HOUSE'
    metadata.contacts[0].postcode = 'BS1 5AH'

    returnsToSpecialCharacters = {
      licence: await LicenceHelper.add({ licenceRef: '03/28/01/0170' }),
      licenceDocumentHeader: await LicenceDocumentHeaderHelper.add({ licenceRef: '03/28/01/0170', metadata })
    }
  })

  afterAll(async () => {
    await noInvalidAddress.licence.$query().delete()
    await noInvalidAddress.licenceDocumentHeader.$query().delete()
    await currentLicenceHolder.licence.$query().delete()
    await currentLicenceHolder.licenceDocumentHeader.$query().delete()
    await licenceHolderExpiresTomorrow.licence.$query().delete()
    await licenceHolderExpiresTomorrow.licenceDocumentHeader.$query().delete()
    await licenceHolderExpiredYesterday.licence.$query().delete()
    await licenceHolderExpiredYesterday.licenceDocumentHeader.$query().delete()
    await returnsToLapsesTomorrow.licence.$query().delete()
    await returnsToLapsesTomorrow.licenceDocumentHeader.$query().delete()
    await returnsToRevokedTomorrow.licence.$query().delete()
    await returnsToRevokedTomorrow.licenceDocumentHeader.$query().delete()
    await returnsToSpecialCharacters.licence.$query().delete()
    await returnsToSpecialCharacters.licenceDocumentHeader.$query().delete()
  })

  describe('when called', () => {
    it('returns a list of licences that are missing postcode and country fields', async () => {
      const results = await FetchInvalidAddressesService()

      expect(results.length).toBeGreaterThan(4)
      expect(results).toContainEqual({
        address_line_1: currentLicenceHolder.licenceDocumentHeader.metadata.contacts[0].addressLine1,
        address_line_2: currentLicenceHolder.licenceDocumentHeader.metadata.contacts[0].addressLine2,
        address_line_3: currentLicenceHolder.licenceDocumentHeader.metadata.contacts[0].addressLine3,
        address_line_4: currentLicenceHolder.licenceDocumentHeader.metadata.contacts[0].addressLine4,
        contact_role: 'Licence holder',
        country: null,
        county: currentLicenceHolder.licenceDocumentHeader.metadata.contacts[0].county,
        licence_ends: null,
        licence_ref: '03/28/01/0165',
        postcode: null,
        town: currentLicenceHolder.licenceDocumentHeader.metadata.contacts[0].town
      })
      expect(results).toContainEqual({
        address_line_1: licenceHolderExpiresTomorrow.licenceDocumentHeader.metadata.contacts[0].addressLine1,
        address_line_2: licenceHolderExpiresTomorrow.licenceDocumentHeader.metadata.contacts[0].addressLine2,
        address_line_3: licenceHolderExpiresTomorrow.licenceDocumentHeader.metadata.contacts[0].addressLine3,
        address_line_4: licenceHolderExpiresTomorrow.licenceDocumentHeader.metadata.contacts[0].addressLine4,
        contact_role: 'Licence holder',
        country: null,
        county: licenceHolderExpiresTomorrow.licenceDocumentHeader.metadata.contacts[0].county,
        licence_ends: tomorrow(),
        licence_ref: '03/28/01/0166',
        postcode: null,
        town: licenceHolderExpiresTomorrow.licenceDocumentHeader.metadata.contacts[0].town
      })
      expect(results).toContainEqual({
        address_line_1: licenceHolderExpiresTomorrow.licenceDocumentHeader.metadata.contacts[0].addressLine1,
        address_line_2: licenceHolderExpiresTomorrow.licenceDocumentHeader.metadata.contacts[0].addressLine2,
        address_line_3: licenceHolderExpiresTomorrow.licenceDocumentHeader.metadata.contacts[0].addressLine3,
        address_line_4: licenceHolderExpiresTomorrow.licenceDocumentHeader.metadata.contacts[0].addressLine4,
        contact_role: 'Licence holder',
        country: null,
        county: licenceHolderExpiresTomorrow.licenceDocumentHeader.metadata.contacts[0].county,
        licence_ends: tomorrow(),
        licence_ref: '03/28/01/0166',
        postcode: null,
        town: licenceHolderExpiresTomorrow.licenceDocumentHeader.metadata.contacts[0].town
      })
      expect(results).toContainEqual({
        address_line_1: returnsToLapsesTomorrow.licenceDocumentHeader.metadata.contacts[0].addressLine1,
        address_line_2: returnsToLapsesTomorrow.licenceDocumentHeader.metadata.contacts[0].addressLine2,
        address_line_3: returnsToLapsesTomorrow.licenceDocumentHeader.metadata.contacts[0].addressLine3,
        address_line_4: returnsToLapsesTomorrow.licenceDocumentHeader.metadata.contacts[0].addressLine4,
        contact_role: 'Returns to',
        country: null,
        county: returnsToLapsesTomorrow.licenceDocumentHeader.metadata.contacts[0].county,
        licence_ends: tomorrow(),
        licence_ref: '03/28/01/0168',
        postcode: null,
        town: returnsToLapsesTomorrow.licenceDocumentHeader.metadata.contacts[0].town
      })
      expect(results).toContainEqual({
        address_line_1: returnsToRevokedTomorrow.licenceDocumentHeader.metadata.contacts[0].addressLine1,
        address_line_2: returnsToRevokedTomorrow.licenceDocumentHeader.metadata.contacts[0].addressLine2,
        address_line_3: returnsToRevokedTomorrow.licenceDocumentHeader.metadata.contacts[0].addressLine3,
        address_line_4: returnsToRevokedTomorrow.licenceDocumentHeader.metadata.contacts[0].addressLine4,
        contact_role: 'Returns to',
        country: null,
        county: returnsToRevokedTomorrow.licenceDocumentHeader.metadata.contacts[0].county,
        licence_ends: tomorrow(),
        licence_ref: '03/28/01/0169',
        postcode: null,
        town: returnsToRevokedTomorrow.licenceDocumentHeader.metadata.contacts[0].town
      })
      expect(results).toContainEqual({
        address_line_1: returnsToSpecialCharacters.licenceDocumentHeader.metadata.contacts[0].addressLine1,
        address_line_2: returnsToSpecialCharacters.licenceDocumentHeader.metadata.contacts[0].addressLine2,
        address_line_3: returnsToSpecialCharacters.licenceDocumentHeader.metadata.contacts[0].addressLine3,
        address_line_4: returnsToSpecialCharacters.licenceDocumentHeader.metadata.contacts[0].addressLine4,
        contact_role: 'Returns to',
        country: null,
        county: returnsToSpecialCharacters.licenceDocumentHeader.metadata.contacts[0].county,
        licence_ends: null,
        licence_ref: '03/28/01/0170',
        postcode: returnsToSpecialCharacters.licenceDocumentHeader.metadata.contacts[0].postcode,
        town: returnsToSpecialCharacters.licenceDocumentHeader.metadata.contacts[0].town
      })
    })
  })
})
