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
  let licenceDocumentRole

  describe('when there is a company', () => {
    before(async () => {
      company = await CompanyHelper.add()

      licenceDocument = await LicenceDocumentHelper.add()

      licenceDocumentRole = await LicenceDocumentRoleHelper.add({
        companyId: company.id,
        licenceDocumentId: licenceDocument.id
      })

      licence = await LicenceHelper.add({
        licenceRef: licenceDocument.licenceRef
      })

      licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({
        licenceRef: licenceDocument.licenceRef,
        licenceName: 'Tyrell Corporation'
      })
    })

    it('returns the licences for the company', async () => {
      const result = await FetchLicencesService.go(company.id)

      expect(result).to.equal([
        {
          id: licenceDocumentRole.id,
          licenceDocument: {
            endDate: null,
            id: licenceDocument.id,
            licence: {
              id: licence.id,
              licenceDocumentHeader: {
                id: licenceDocumentHeader.id,
                licenceName: 'Tyrell Corporation'
              },
              licenceRef: licence.licenceRef
            },
            startDate: new Date('2022-01-01')
          }
        }
      ])
    })
  })
})
