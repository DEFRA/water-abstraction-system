'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CompanyHelper = require('../../support/helpers/company.helper.js')
const LicenceDocumentRoleHelper = require('../../support/helpers/licence-document-role.helper.js')
const LicenceDocumentHelper = require('../../support/helpers/licence-document.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceDocumentHeaderHelper = require('../../support/helpers/licence-document-header.helper.js')

// Thing under test
const FetchLicencesService = require('../../../app/services/customers/fetch-licences.service.js')

describe('Customers - Fetch licence service', () => {
  let company
  let licence
  let licenceDocument
  let licenceDocumentHeader

  describe('when there is a company', () => {
    before(async () => {
      company = await CompanyHelper.add()

      licenceDocument = await LicenceDocumentHelper.add()

      licence = await LicenceHelper.add({
        licenceRef: licenceDocument.licenceRef
      })

      licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({
        licenceRef: licenceDocument.licenceRef,
        licenceName: 'Tyrell Corporation'
      })

      await LicenceDocumentRoleHelper.add({
        companyId: company.id,
        licenceDocumentId: licenceDocument.id
      })

      await _addAdditionalLicences(company)
    })

    it('returns the licences for the company', async () => {
      const result = await FetchLicencesService.go(company.id)

      expect(result).to.equal({
        licences: [
          {
            endDate: null,
            id: licence.id,
            licenceRef: licence.licenceRef,
            licenceDocumentHeader: {
              id: licenceDocumentHeader.id,
              licenceName: 'Tyrell Corporation'
            },
            startDate: new Date('2022-01-01')
          }
        ],
        pagination: {
          total: 1
        }
      })
    })
  })
})

async function _addAdditionalLicences(company) {
  // Duplicate - same company -
  // const licenceDocumentTwo = await LicenceDocumentHelper.add()
  //
  // await LicenceHelper.add({
  //   licenceRef: licenceDocumentTwo.licenceRef
  // })
  //
  // await LicenceDocumentRoleHelper.add({
  //   companyId: company.id,
  //   licenceDocumentId: licenceDocumentTwo.id
  // })

  // Add a licence document with a different company id - this should not be returned
  const differentCompanyIdLicenceDocument = await LicenceDocumentHelper.add()

  await LicenceHelper.add({
    licenceRef: differentCompanyIdLicenceDocument.licenceRef
  })

  await LicenceDocumentRoleHelper.add({
    licenceDocumentId: differentCompanyIdLicenceDocument.id
  })
}
