'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, beforeEach } = require('node:test')
const { expect } = Code

// Thing under test
const ImportCompanyContactValidator = require('../../../app/validators/import/contact.validator.js')

describe('Import Contact validator', () => {
  let transformedContact

  beforeEach(async () => {
    transformedContact = _transformedContact()
  })

  describe('when valid data is provided', () => {
    it('does not throw an error', () => {
      expect(() => {
        ImportCompanyContactValidator.go(transformedContact)
      }).to.not.throw()
    })
  })

  describe('the "salutation" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedContact.salutation = 1
      })

      it('throws an error', async () => {
        expect(() => {
          ImportCompanyContactValidator.go(transformedContact)
        }).to.throw('"salutation" must be a string')
      })
    })

    describe('when it null', () => {
      beforeEach(() => {
        transformedContact.salutation = null
      })

      it('does not throw an error', async () => {
        expect(() => {
          ImportCompanyContactValidator.go(transformedContact)
        }).to.not.throw()
      })
    })
  })

  describe('the "initials" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedContact.initials = 1
      })

      it('throws an error', async () => {
        expect(() => {
          ImportCompanyContactValidator.go(transformedContact)
        }).to.throw('"initials" must be a string')
      })
    })

    describe('when it null', () => {
      beforeEach(() => {
        transformedContact.initials = null
      })

      it('does not throw an error', async () => {
        expect(() => {
          ImportCompanyContactValidator.go(transformedContact)
        }).to.not.throw()
      })
    })
  })

  describe('the "firstName" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedContact.firstName = 1
      })

      it('throws an error', async () => {
        expect(() => {
          ImportCompanyContactValidator.go(transformedContact)
        }).to.throw('"firstName" must be a string')
      })
    })

    describe('when it null', () => {
      beforeEach(() => {
        transformedContact.firstName = null
      })

      it('does not throw an error', async () => {
        expect(() => {
          ImportCompanyContactValidator.go(transformedContact)
        }).to.not.throw()
      })
    })
  })

  describe('the "lastName" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedContact.lastName = 1
      })

      it('throws an error', async () => {
        expect(() => {
          ImportCompanyContactValidator.go(transformedContact)
        }).to.throw('"lastName" must be a string')
      })
    })

    describe('when it null', () => {
      beforeEach(() => {
        transformedContact.lastName = null
      })

      it('does not throw an error', async () => {
        expect(() => {
          ImportCompanyContactValidator.go(transformedContact)
        }).to.not.throw()
      })
    })
  })

  describe('the "externalId" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedContact.externalId = 1
      })

      it('throws an error', async () => {
        expect(() => {
          ImportCompanyContactValidator.go(transformedContact)
        }).to.throw('"externalId" must be a string')
      })
    })

    describe('when it is not present', () => {
      beforeEach(() => {
        delete transformedContact.externalId
      })

      it('throws an error', async () => {
        expect(() => {
          ImportCompanyContactValidator.go(transformedContact)
        }).to.throw('"externalId" is required')
      })
    })
  })
})

function _transformedContact () {
  return {
    salutation: 'Mr',
    initials: 'H',
    firstName: 'James',
    lastName: 'Bond',
    externalId: '1:1940'
  }
}
