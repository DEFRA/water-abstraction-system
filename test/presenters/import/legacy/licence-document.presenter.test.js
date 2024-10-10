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
      dateDeleted: null,
      documentRef: licenceRef,
      documentType: 'abstraction_licence',
      endDate: null,
      externalId: '0:007',
      regime: 'water',
      startDate: new Date('1999-01-01')
    })
  })

  it('correctly sets the default data', () => {
    const result = LicenceDocumentPresenter.go(legacyLicenceDocument)

    expect(result.dateDeleted).to.be.null()
    expect(result.documentType).to.equal('abstraction_licence')
    expect(result.regime).to.equal('water')
  })
})

function _legacyLicenceDocument (licenceRef) {
  return {
    end_date: null,
    start_date: new Date('1999-01-01'),
    external_id: '0:007',
    document_ref: licenceRef
  }
}
