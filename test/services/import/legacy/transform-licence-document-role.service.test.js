'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Things to stub
const FetchLicenceDocumentRolesService = require('../../../../app/services/import/legacy/fetch-licence-document-roles.service.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const TransformLicenceDocumentRolesService =
  require('../../../../app/services/import/legacy/transform-licence-document-roles.service.js')

describe('Import Legacy Transform Licence Document Role service', () => {
  // NOTE: Clearly this is an incomplete representation of the licence returned from TransformedLicenceService. But for
  // the purposes of this service it is all that is needed
  const transformedLicence = { licenceDocument: { licenceDocumentRoles: [] } }

  const naldLicenceId = '2113'
  const regionCode = '6'

  let legacyLicenceDocument
  let licenceRef
  let licenceRoleId

  beforeEach(() => {
    licenceRef = generateLicenceRef()
    licenceRoleId = generateUUID()

    legacyLicenceDocument = _legacyLicenceDocumentRole(licenceRoleId)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a matching valid legacy licence document role is found', () => {
    beforeEach(() => {
      Sinon.stub(FetchLicenceDocumentRolesService, 'go').resolves([legacyLicenceDocument])
    })

    it('attaches the record transformed and validated for WRLS to the transformed licence', async () => {
      await TransformLicenceDocumentRolesService.go(regionCode, naldLicenceId, transformedLicence, licenceRef)

      expect(transformedLicence.licenceDocument.licenceDocumentRoles).to.equal([
        {
          addressId: '1:007',
          companyId: '1:007',
          contactId: '1:008',
          documentId: licenceRef,
          endDate: null,
          licenceRoleId,
          startDate: new Date('1999-01-01')
        }
      ])
    })
  })

  describe('when no matching legacy licence document role is found', () => {
    beforeEach(() => {
      Sinon.stub(FetchLicenceDocumentRolesService, 'go').resolves(null)
    })

    it('throws an error', async () => {
      await expect(TransformLicenceDocumentRolesService.go(regionCode, naldLicenceId, transformedLicence, licenceRef))
        .to.reject()
    })
  })
})

function _legacyLicenceDocumentRole (licenceRoleId) {
  return {
    address_id: '1:007',
    company_id: '1:007',
    contact_id: '1:008',
    end_date: null,
    start_date: new Date('1999-01-01'),
    licence_role_id: licenceRoleId
  }
}
