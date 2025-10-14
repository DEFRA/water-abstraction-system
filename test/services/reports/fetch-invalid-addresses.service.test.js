'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, after, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { tomorrow, yesterday } = require('../../support/general.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceDocumentHeaderHelper = require('../../support/helpers/licence-document-header.helper.js')

// Thing under test
const FetchInvalidAddressesService = require('../../../app/services/reports/fetch-invalid-addresses.service.js')

describe('Reports - Fetch Invalid Addresses service', () => {
  const metadata = {
    contacts: [
      {
        role: 'Licence holder',
        town: 'BRISTOL',
        county: 'AVON',
        country: null,
        postcode: null,
        addressLine1: 'ENVIRONMENT AGENCY',
        addressLine2: 'HORIZON HOUSE',
        addressLine3: 'DEANERY ROAD',
        addressLine4: null
      }
    ]
  }

  let currentLicenceHolder
  let licenceHolderExpiresTomorrow
  let licenceHolderExpiredYesterday
  let noInvalidAddress
  let returnsToLapsesTomorrow
  let returnsToRevokedTomorrow

  before(async () => {
    noInvalidAddress = {
      licenceDocumentHeader: await LicenceDocumentHeaderHelper.add({ licenceRef: '03/28/01/0164' }),
      licence: await LicenceHelper.add({ licenceRef: '03/28/01/0164' })
    }

    currentLicenceHolder = {
      licenceDocumentHeader: await LicenceDocumentHeaderHelper.add({ metadata, licenceRef: '03/28/01/0165' }),
      licence: await LicenceHelper.add({ licenceRef: '03/28/01/0165' })
    }

    licenceHolderExpiresTomorrow = {
      licenceDocumentHeader: await LicenceDocumentHeaderHelper.add({ metadata, licenceRef: '03/28/01/0166' }),
      licence: await LicenceHelper.add({ expiredDate: tomorrow(), licenceRef: '03/28/01/0166' })
    }

    licenceHolderExpiredYesterday = {
      licenceDocumentHeader: await LicenceDocumentHeaderHelper.add({ metadata, licenceRef: '03/28/01/0167' }),
      licence: await LicenceHelper.add({ expiredDate: yesterday(), licenceRef: '03/28/01/0167' })
    }

    metadata.contacts[0].role = 'Returns to'

    returnsToLapsesTomorrow = {
      licenceDocumentHeader: await LicenceDocumentHeaderHelper.add({ metadata, licenceRef: '03/28/01/0168' }),
      licence: await LicenceHelper.add({ lapsedDate: tomorrow(), licenceRef: '03/28/01/0168' })
    }
    returnsToRevokedTomorrow = {
      licenceDocumentHeader: await LicenceDocumentHeaderHelper.add({ metadata, licenceRef: '03/28/01/0169' }),
      licence: await LicenceHelper.add({ revokedDate: tomorrow(), licenceRef: '03/28/01/0169' })
    }
  })

  after(async () => {
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
  })

  describe('when called', () => {
    it('returns a list of licences that are missing postcode and country fields', async () => {
      const result = await FetchInvalidAddressesService.go()

      expect(result.length).to.equal(4)
      expect(result).to.equal([
        {
          licence_ref: '03/28/01/0165',
          licence_ends: null,
          contact_role: 'Licence holder',
          address_line_1: metadata.contacts[0].addressLine1,
          address_line_2: metadata.contacts[0].addressLine2,
          address_line_3: metadata.contacts[0].addressLine3,
          address_line_4: metadata.contacts[0].addressLine4,
          town: metadata.contacts[0].town,
          county: metadata.contacts[0].county,
          postcode: null,
          country: null
        },
        {
          licence_ref: '03/28/01/0166',
          licence_ends: tomorrow(),
          contact_role: 'Licence holder',
          address_line_1: metadata.contacts[0].addressLine1,
          address_line_2: metadata.contacts[0].addressLine2,
          address_line_3: metadata.contacts[0].addressLine3,
          address_line_4: metadata.contacts[0].addressLine4,
          town: metadata.contacts[0].town,
          county: metadata.contacts[0].county,
          postcode: null,
          country: null
        },
        {
          licence_ref: '03/28/01/0168',
          licence_ends: tomorrow(),
          contact_role: 'Returns to',
          address_line_1: metadata.contacts[0].addressLine1,
          address_line_2: metadata.contacts[0].addressLine2,
          address_line_3: metadata.contacts[0].addressLine3,
          address_line_4: metadata.contacts[0].addressLine4,
          town: metadata.contacts[0].town,
          county: metadata.contacts[0].county,
          postcode: null,
          country: null
        },
        {
          licence_ref: '03/28/01/0169',
          licence_ends: tomorrow(),
          contact_role: 'Returns to',
          address_line_1: metadata.contacts[0].addressLine1,
          address_line_2: metadata.contacts[0].addressLine2,
          address_line_3: metadata.contacts[0].addressLine3,
          address_line_4: metadata.contacts[0].addressLine4,
          town: metadata.contacts[0].town,
          county: metadata.contacts[0].county,
          postcode: null,
          country: null
        }
      ])
    })
  })
})
