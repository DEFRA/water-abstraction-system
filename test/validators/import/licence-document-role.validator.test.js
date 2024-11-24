'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const LicenceDocumentRoleValidator = require('../../../app/validators/import/licence-document-role.validator.js')

describe('Import Licence Document role validator', () => {
  let transformedLicenceDocumentRole

  beforeEach(async () => {
    transformedLicenceDocumentRole = _transformedLicenceDocumentRoleRole()
  })

  describe('when valid data is provided', () => {
    it('does not throw an error', () => {
      expect(() => {
        LicenceDocumentRoleValidator.go(transformedLicenceDocumentRole)
      }).to.not.throw()
    })
  })

  describe('the "addressId" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedLicenceDocumentRole.addressId = 1
      })

      it('throws an error', () => {
        expect(() => {
          LicenceDocumentRoleValidator.go(transformedLicenceDocumentRole)
        }).to.throw('"addressId" must be a string')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceDocumentRole.addressId = null
      })

      it('throws an error', () => {
        expect(() => {
          LicenceDocumentRoleValidator.go(transformedLicenceDocumentRole)
        }).to.throw('"addressId" must be a string')
      })
    })

    describe('when it does not exist', () => {
      beforeEach(() => {
        delete transformedLicenceDocumentRole.addressId
      })

      it('throws an error', () => {
        expect(() => {
          LicenceDocumentRoleValidator.go(transformedLicenceDocumentRole)
        }).to.throw('"addressId" is required')
      })
    })
  })

  describe('the "companyId" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedLicenceDocumentRole.companyId = 1
      })

      it('throws an error', () => {
        expect(() => {
          LicenceDocumentRoleValidator.go(transformedLicenceDocumentRole)
        }).to.throw('"companyId" must be a string')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceDocumentRole.companyId = null
      })

      it('throws an error', () => {
        expect(() => {
          LicenceDocumentRoleValidator.go(transformedLicenceDocumentRole)
        }).to.throw('"companyId" must be a string')
      })
    })

    describe('when it does not exist', () => {
      beforeEach(() => {
        delete transformedLicenceDocumentRole.companyId
      })

      it('throws an error', () => {
        expect(() => {
          LicenceDocumentRoleValidator.go(transformedLicenceDocumentRole)
        }).to.throw('"companyId" is required')
      })
    })
  })

  describe('the "contactId" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedLicenceDocumentRole.contactId = 1
      })

      it('throws an error', () => {
        expect(() => {
          LicenceDocumentRoleValidator.go(transformedLicenceDocumentRole)
        }).to.throw('"contactId" must be a string')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceDocumentRole.contactId = null
      })

      it('does not throw an error', () => {
        expect(() => {
          LicenceDocumentRoleValidator.go(transformedLicenceDocumentRole)
        }).to.not.throw()
      })
    })

    describe('when it does not exist', () => {
      beforeEach(() => {
        delete transformedLicenceDocumentRole.contactId
      })

      it('does not throw an error', () => {
        expect(() => {
          LicenceDocumentRoleValidator.go(transformedLicenceDocumentRole)
        }).to.not.throw()
      })
    })
  })

  describe('the "documentId" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedLicenceDocumentRole.documentId = 1
      })

      it('throws an error', () => {
        expect(() => {
          LicenceDocumentRoleValidator.go(transformedLicenceDocumentRole)
        }).to.throw('"documentId" must be a string')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceDocumentRole.documentId = null
      })

      it('throws an error', () => {
        expect(() => {
          LicenceDocumentRoleValidator.go(transformedLicenceDocumentRole)
        }).to.throw('"documentId" must be a string')
      })
    })
  })

  describe('the "licenceRoleId" property', () => {
    describe('when it is not a guid', () => {
      beforeEach(() => {
        transformedLicenceDocumentRole.licenceRoleId = '123'
      })

      it('throws an error', () => {
        expect(() => {
          LicenceDocumentRoleValidator.go(transformedLicenceDocumentRole)
        }).to.throw('"licenceRoleId" must be a valid GUID')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceDocumentRole.licenceRoleId = null
      })

      it('throws an error', () => {
        expect(() => {
          LicenceDocumentRoleValidator.go(transformedLicenceDocumentRole)
        }).to.throw('"licenceRoleId" must be a string')
      })
    })
  })

  describe('the "endDate" property', () => {
    describe('when it is not a date', () => {
      beforeEach(() => {
        transformedLicenceDocumentRole.endDate = 1
      })

      it('throws an error', () => {
        expect(() => {
          LicenceDocumentRoleValidator.go(transformedLicenceDocumentRole)
        }).to.throw('"endDate" must be a valid date')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceDocumentRole.endDate = null
      })

      it('does not throw an error', () => {
        expect(() => {
          LicenceDocumentRoleValidator.go(transformedLicenceDocumentRole)
        }).not.to.throw()
      })
    })
  })

  describe('the "startDate" property', () => {
    describe('when it is not a date', () => {
      beforeEach(() => {
        transformedLicenceDocumentRole.startDate = 1
      })

      it('throws an error', () => {
        expect(() => {
          LicenceDocumentRoleValidator.go(transformedLicenceDocumentRole)
        }).to.throw('"startDate" must be a valid date')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceDocumentRole.startDate = null
      })

      it('throws an error', () => {
        expect(() => {
          LicenceDocumentRoleValidator.go(transformedLicenceDocumentRole)
        }).to.throw('"startDate" must be a valid date')
      })
    })
  })
})

function _transformedLicenceDocumentRoleRole() {
  return {
    addressId: '1:007',
    companyId: '1:007',
    contactId: '1:008',
    documentId: generateLicenceRef(),
    licenceRoleId: generateUUID(),
    endDate: null,
    startDate: new Date('1999-01-01')
  }
}
