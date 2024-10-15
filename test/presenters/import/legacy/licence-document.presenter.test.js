'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Thing under test
const LicenceDocumentPresenter = require('../../../../app/presenters/import/legacy/licence-document.presenter.js')

describe('Import Legacy Licence Document presenter', () => {
  let legacyLicenceDocument
  let licenceRef

  beforeEach(() => {
    licenceRef = generateLicenceRef()

    legacyLicenceDocument = _legacyLicenceDocument(licenceRef)
  })

  it('correctly transforms the data', () => {
    const result = LicenceDocumentPresenter.go(legacyLicenceDocument)

    expect(result).to.equal({
      deletedAt: null,
      licenceRef,
      endDate: null,
      startDate: new Date('1999-01-01')
    })
  })

  it('correctly sets the default data', () => {
    const result = LicenceDocumentPresenter.go(legacyLicenceDocument)

    expect(result.deletedAt).to.be.null()
  })
})

function _legacyLicenceDocument (licenceRef) {
  return {
    end_date: null,
    start_date: new Date('1999-01-01'),
    licence_ref: licenceRef
  }
}
