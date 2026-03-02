'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, before, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CompanyHelper = require('../../support/helpers/company.helper.js')
const LicenceDocumentHelper = require('../../support/helpers/licence-document.helper.js')
const LicenceDocumentHeaderHelper = require('../../support/helpers/licence-document-header.helper.js')
const LicenceDocumentRoleHelper = require('../../support/helpers/licence-document-role.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceRoleHelper = require('../../support/helpers/licence-role.helper.js')

// Things we need to stub
const DatabaseConfig = require('../../../config/database.config.js')

// Thing under test
const FetchLicencesService = require('../../../app/services/companies/fetch-licences.service.js')

describe('Companies - Fetch Licences service', () => {
  let company
  let licence
  let licenceDocument
  let licenceDocumentHeader
  let licenceDocumentOther
  let licenceDocumentRole
  let licenceDocumentRoleOther
  let pageNumber

  before(async () => {
    company = await CompanyHelper.add()
    licence = await LicenceHelper.add()
    licenceDocument = await LicenceDocumentHelper.add({
      licenceRef: licence.licenceRef
    })

    // NOTE: This is needed to confirm we can retrieve the 'name' for the licence, which can be assigned by external
    // users when the register as the primary user.
    licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({
      licenceRef: licenceDocument.licenceRef,
      licenceName: 'Tyrell Corporation'
    })

    licenceDocumentRole = await LicenceDocumentRoleHelper.add({
      companyId: company.id,
      licenceDocumentId: licenceDocument.id,
      licenceRoleId: LicenceRoleHelper.select('licenceHolder').id
    })

    // NOTE: This role is for the same company, but a different licence where they are only the 'returns to' contact.
    // This should NOT be returned in the results.
    licenceDocumentOther = await LicenceDocumentHelper.add()
    licenceDocumentRoleOther = await LicenceDocumentRoleHelper.add({
      companyId: company.id,
      licenceDocumentId: licenceDocumentOther.id,
      licenceRoleId: LicenceRoleHelper.select('returnsTo').id
    })
  })

  beforeEach(() => {
    pageNumber = 1

    // NOTE: We set the default page size to 1000 to ensure we get all records and avoid failed tests when run as
    // part of the full suite, and the risk our test record is returned in the second page of results.
    Sinon.stub(DatabaseConfig, 'defaultPageSize').value(1000)
  })

  afterEach(() => {
    Sinon.restore()
  })

  afterEach(async () => {
    await licenceDocumentRole.$query().delete()
    await licenceDocumentRoleOther.$query().delete()
    await licenceDocumentHeader.$query().delete()
    await licenceDocument.$query().delete()
    await licence.$query().delete()
    await company.$query().delete()
  })

  describe('when called', () => {
    it('returns licences linked to the company where it is the licence holder', async () => {
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
        totalNumber: 1
      })
    })
  })
})
