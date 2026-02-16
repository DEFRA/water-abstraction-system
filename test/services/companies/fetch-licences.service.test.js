'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, before, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CompanyHelper = require('../../support/helpers/company.helper.js')
const LicenceDocumentRoleHelper = require('../../support/helpers/licence-document-role.helper.js')
const LicenceDocumentHelper = require('../../support/helpers/licence-document.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceDocumentHeaderHelper = require('../../support/helpers/licence-document-header.helper.js')

// Things we need to stub
const databaseConfig = require('../../../config/database.config.js')

// Thing under test
const FetchLicencesService = require('../../../app/services/companies/fetch-licences.service.js')

describe('Companies - Fetch Licences service', () => {
  let company
  let licence
  let licenceDocument
  let licenceDocumentHeader
  let pageNumber

  beforeEach(() => {
    pageNumber = 1

    // NOTE: We set the default page size to 1000 to ensure we get all records and avoid failed tests when run as
    // part of the full suite, and the risk our test record is returned in the second page of results.
    Sinon.stub(databaseConfig, 'defaultPageSize').value(1000)
  })

  afterEach(() => {
    Sinon.restore()
  })

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

      await _addAdditionalLicences()
    })

    it('returns the licences for the company', async () => {
      const result = await FetchLicencesService.go(company.id, pageNumber)

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

async function _addAdditionalLicences() {
  // Add a licence document with a different company id - this should not be returned
  const differentCompanyIdLicenceDocument = await LicenceDocumentHelper.add()

  await LicenceHelper.add({
    licenceRef: differentCompanyIdLicenceDocument.licenceRef
  })

  await LicenceDocumentRoleHelper.add({
    licenceDocumentId: differentCompanyIdLicenceDocument.id
  })
}
