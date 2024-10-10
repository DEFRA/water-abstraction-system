'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
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

  describe('the "dateDeleted" property', () => {
    describe('when it is not null', () => {
      beforeEach(() => {
        transformedLicenceDocument.dateDeleted = 'something_else'
      })

      it('throws an error', () => {
        expect(() => {
          LicenceDocumentValidator.go(transformedLicenceDocument)
        }).to.throw('"dateDeleted" must be [null]')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceDocument.dateDeleted = null
      })

      it('does not throw an error', () => {
        expect(() => {
          LicenceDocumentValidator.go(transformedLicenceDocument)
        }).to.not.throw()
      })
    })
  })

  describe('the "documentRef" property', () => {
    describe('when it is not a date', () => {
      beforeEach(() => {
        transformedLicenceDocument.documentRef = 1
      })

      it('throws an error', () => {
        expect(() => {
          LicenceDocumentValidator.go(transformedLicenceDocument)
        }).to.throw('"documentRef" must be a string')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceDocument.documentRef = null
      })

      it('throws an error', () => {
        expect(() => {
          LicenceDocumentValidator.go(transformedLicenceDocument)
        }).to.throw('"documentRef" must be a string')
      })
    })
  })

  describe('the "documentType" property', () => {
    describe('when it is not set to "abstraction_licence" ', () => {
      beforeEach(() => {
        transformedLicenceDocument.documentType = 'something_else'
      })

      it('throws an error', () => {
        expect(() => {
          LicenceDocumentValidator.go(transformedLicenceDocument)
        }).to.throw('"documentType" must be [abstraction_licence]')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceDocument.documentType = null
      })

      it('throws an error', () => {
        expect(() => {
          LicenceDocumentValidator.go(transformedLicenceDocument)
        }).to.throw('"documentType" must be [abstraction_licence]')
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

  describe('the "externalId" property', () => {
    describe('when it is not a date', () => {
      beforeEach(() => {
        transformedLicenceDocument.externalId = 1
      })

      it('throws an error', () => {
        expect(() => {
          LicenceDocumentValidator.go(transformedLicenceDocument)
        }).to.throw('"externalId" must be a string')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceDocument.externalId = null
      })

      it('throws an error', () => {
        expect(() => {
          LicenceDocumentValidator.go(transformedLicenceDocument)
        }).to.throw('"externalId" must be a string')
      })
    })
  })

  describe('the "regime" property', () => {
    describe('when it is not set to "water" ', () => {
      beforeEach(() => {
        transformedLicenceDocument.regime = 'hot'
      })

      it('throws an error', () => {
        expect(() => {
          LicenceDocumentValidator.go(transformedLicenceDocument)
        }).to.throw('"regime" must be [water]')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceDocument.regime = null
      })

      it('throws an error', () => {
        expect(() => {
          LicenceDocumentValidator.go(transformedLicenceDocument)
        }).to.throw('"regime" must be [water]')
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
})

function _transformedLicenceDocument () {
  return {
    dateDeleted: null,
    documentRef: generateLicenceRef(),
    documentType: 'abstraction_licence',
    endDate: new Date('2052-06-23'),
    externalId: '0:007',
    regime: 'water',
    startDate: new Date('1992-08-19')
  }
}
