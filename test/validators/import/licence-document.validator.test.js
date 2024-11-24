'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')

// Thing under test
const LicenceDocumentValidator = require('../../../app/validators/import/licence-document.validator.js')

describe('Import Licence Document validator', () => {
  let transformedLicenceDocument

  beforeEach(async () => {
    transformedLicenceDocument = _transformedLicenceDocument()
  })

  describe('when valid data is provided', () => {
    it('does not throw an error', () => {
      expect(() => {
        LicenceDocumentValidator.go(transformedLicenceDocument)
      }).to.not.throw()
    })
  })

  describe('the "licenceRef" property', () => {
    describe('when it is not a date', () => {
      beforeEach(() => {
        transformedLicenceDocument.licenceRef = 1
      })

      it('throws an error', () => {
        expect(() => {
          LicenceDocumentValidator.go(transformedLicenceDocument)
        }).to.throw('"licenceRef" must be a string')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceDocument.licenceRef = null
      })

      it('throws an error', () => {
        expect(() => {
          LicenceDocumentValidator.go(transformedLicenceDocument)
        }).to.throw('"licenceRef" must be a string')
      })
    })
  })

  describe('the "endDate" property', () => {
    describe('when it is not a date', () => {
      beforeEach(() => {
        transformedLicenceDocument.endDate = 1
      })

      it('throws an error', () => {
        expect(() => {
          LicenceDocumentValidator.go(transformedLicenceDocument)
        }).to.throw('"endDate" must be a valid date')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceDocument.endDate = null
      })

      it('does not throw an error', () => {
        expect(() => {
          LicenceDocumentValidator.go(transformedLicenceDocument)
        }).not.to.throw()
      })
    })
  })

  describe('the "startDate" property', () => {
    describe('when it is not a date', () => {
      beforeEach(() => {
        transformedLicenceDocument.startDate = 1
      })

      it('throws an error', () => {
        expect(() => {
          LicenceDocumentValidator.go(transformedLicenceDocument)
        }).to.throw('"startDate" must be a valid date')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceDocument.startDate = null
      })

      it('throws an error', () => {
        expect(() => {
          LicenceDocumentValidator.go(transformedLicenceDocument)
        }).to.throw('"startDate" must be a valid date')
      })
    })
  })

  describe('the "licenceDocumentRoles" property', () => {
    describe('when it is not an array', () => {
      beforeEach(() => {
        transformedLicenceDocument.licenceDocumentRoles = 1
      })

      it('throws an error', () => {
        expect(() => {
          LicenceDocumentValidator.go(transformedLicenceDocument)
        }).to.throw('"licenceDocumentRoles" must be an array')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceDocument.licenceDocumentRoles = null
      })

      it('throws an error', () => {
        expect(() => {
          LicenceDocumentValidator.go(transformedLicenceDocument)
        }).to.throw('"licenceDocumentRoles" must be an array')
      })
    })
  })
})

function _transformedLicenceDocument() {
  return {
    licenceRef: generateLicenceRef(),
    endDate: new Date('2052-06-23'),
    startDate: new Date('1992-08-19'),
    licenceDocumentRoles: []
  }
}
