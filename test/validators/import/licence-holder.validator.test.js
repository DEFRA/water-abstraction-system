'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const ImportLicenceHolderValidator = require('../../../app/validators/import/licence-holder.validator.js')

describe('Import Licence Holder validator', () => {
  let transformedLicenceHolder

  beforeEach(async () => {
    transformedLicenceHolder = _transfromedLicenceHolder()
  })

  describe('when valid data is provided', () => {
    it('does not throw an error', () => {
      expect(() => {
        ImportLicenceHolderValidator.go(transformedLicenceHolder)
      }).to.not.throw()
    })
  })

  describe('the "companyExternalId" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedLicenceHolder.companyExternalId = 1
      })

      it('throws an error', async () => {
        expect(() => {
          ImportLicenceHolderValidator.go(transformedLicenceHolder)
        }).to.throw('"companyExternalId" must be a string')
      })
    })

    describe('when it is not present', () => {
      beforeEach(() => {
        delete transformedLicenceHolder.companyExternalId
      })

      it('throws an error', async () => {
        expect(() => {
          ImportLicenceHolderValidator.go(transformedLicenceHolder)
        }).to.throw('"companyExternalId" is required')
      })
    })
  })

  describe('the "contactExternalId" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedLicenceHolder.contactExternalId = 1
      })

      it('throws an error', async () => {
        expect(() => {
          ImportLicenceHolderValidator.go(transformedLicenceHolder)
        }).to.throw('"contactExternalId" must be a string')
      })
    })

    describe('when it is not present', () => {
      beforeEach(() => {
        delete transformedLicenceHolder.contactExternalId
      })

      it('throws an error', async () => {
        expect(() => {
          ImportLicenceHolderValidator.go(transformedLicenceHolder)
        }).to.throw('"contactExternalId" is required')
      })
    })
  })

  describe('the "startDate" property', () => {
    describe('when it is not a date', () => {
      beforeEach(() => {
        transformedLicenceHolder.startDate = 1
      })

      it('throws an error', async () => {
        expect(() => {
          ImportLicenceHolderValidator.go(transformedLicenceHolder)
        }).to.throw('"startDate" must be a valid date')
      })
    })

    describe('when it is not present', () => {
      beforeEach(() => {
        delete transformedLicenceHolder.startDate
      })

      it('throws an error', async () => {
        expect(() => {
          ImportLicenceHolderValidator.go(transformedLicenceHolder)
        }).to.throw('"startDate" is required')
      })
    })
  })

  describe('the "licenceRoleId" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedLicenceHolder.licenceRoleId = 1
      })

      it('throws an error', async () => {
        expect(() => {
          ImportLicenceHolderValidator.go(transformedLicenceHolder)
        }).to.throw('"licenceRoleId" must be a string')
      })
    })

    describe('when it is not a valid GUID', () => {
      beforeEach(() => {
        transformedLicenceHolder.licenceRoleId = '123'
      })

      it('throws an error', async () => {
        expect(() => {
          ImportLicenceHolderValidator.go(transformedLicenceHolder)
        }).to.throw('"licenceRoleId" must be a valid GUID')
      })
    })

    describe('when it is not present', () => {
      beforeEach(() => {
        delete transformedLicenceHolder.licenceRoleId
      })

      it('throws an error', async () => {
        expect(() => {
          ImportLicenceHolderValidator.go(transformedLicenceHolder)
        }).to.throw('"licenceRoleId" is required')
      })
    })
  })
})

function _transfromedLicenceHolder () {
  return {
    companyExternalId: '1:007',
    contactExternalId: '1:007',
    startDate: new Date('2001-01-01'),
    licenceRoleId: generateUUID()
  }
}
