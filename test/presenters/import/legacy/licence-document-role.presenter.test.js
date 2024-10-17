'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const LicenceDocumentRolePresenter = require('../../../../app/presenters/import/legacy/licence-document-role.presenter.js')

describe('Import Legacy Licence Document role presenter', () => {
  let legacyLicenceDocumentRole
  let licenceRef
  let licenceRoleId

  beforeEach(() => {
    licenceRef = generateLicenceRef()
    licenceRoleId = generateUUID()

    legacyLicenceDocumentRole = _legacyLicenceDocumentRole(licenceRef, licenceRoleId)
  })

  it('correctly transforms the data', () => {
    const result = LicenceDocumentRolePresenter.go(legacyLicenceDocumentRole, licenceRef)

    expect(result).to.equal({
      addressId: '1:007',
      companyId: '1:007',
      contactId: '1:008',
      documentId: licenceRef,
      licenceRoleId,
      endDate: null,
      startDate: new Date('1999-01-01')
    })
  })
})

function _legacyLicenceDocumentRole (licenceRef, licenceRoleId) {
  return {
    address_id: '1:007',
    company_id: '1:007',
    contact_id: '1:008',
    end_date: null,
    start_date: new Date('1999-01-01'),
    licence_role_id: licenceRoleId
  }
}
