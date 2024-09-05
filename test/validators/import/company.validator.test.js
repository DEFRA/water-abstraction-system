'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ImportCompanyValidator = require('../../../app/validators/import/company.validator.js')

describe('Import Company validator', () => {
  let transformedCompany

  beforeEach(async () => {
    transformedCompany = _transformedCompany()
  })

  describe('when valid data is provided', () => {
    it('does not throw an error', () => {
      expect(() => {
        ImportCompanyValidator.go(transformedCompany)
      }).to.not.throw()
    })
  })

  describe('the "name" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedCompany.name = 1
      })

      it('throws an error', async () => {
        expect(() => {
          ImportCompanyValidator.go(transformedCompany)
        }).to.throw('"name" must be a string')
      })
    })

    describe('when it is not present', () => {
      beforeEach(() => {
        delete transformedCompany.name
      })

      it('throws an error', async () => {
        expect(() => {
          ImportCompanyValidator.go(transformedCompany)
        }).to.throw('"name" is required')
      })
    })
  })

  describe('the "type" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedCompany.type = 1
      })

      it('throws an error', async () => {
        expect(() => {
          ImportCompanyValidator.go(transformedCompany)
        }).to.throw('"type" must be one of [organisation, person]')
      })
    })

    describe('when it is not a valid string - organisation or person', () => {
      beforeEach(() => {
        transformedCompany.type = 'org'
      })

      it('throws an error', async () => {
        expect(() => {
          ImportCompanyValidator.go(transformedCompany)
        }).to.throw('"type" must be one of [organisation, person]')
      })
    })

    describe('when it is not present', () => {
      beforeEach(() => {
        delete transformedCompany.type
      })

      it('throws an error', async () => {
        expect(() => {
          ImportCompanyValidator.go(transformedCompany)
        }).to.throw('"type" is required')
      })
    })
  })

  describe('the "externalId" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedCompany.externalId = 1
      })

      it('throws an error', async () => {
        expect(() => {
          ImportCompanyValidator.go(transformedCompany)
        }).to.throw('"externalId" must be a string')
      })
    })

    describe('when it is not a valid string in the external id format', () => {
      beforeEach(() => {
        transformedCompany.externalId = '1234'
      })

      it('throws an error', async () => {
        expect(() => {
          ImportCompanyValidator.go(transformedCompany)
        }).to.throw('"externalId" must be in the format X:YYYY, where X is a single digit and YYYY are digits.')
      })
    })

    describe('when it has letters', () => {
      beforeEach(() => {
        transformedCompany.externalId = 'A:1940'
      })

      it('throws an error', async () => {
        expect(() => {
          ImportCompanyValidator.go(transformedCompany)
        }).to.throw('"externalId" must be in the format X:YYYY, where X is a single digit and YYYY are digits.')
      })
    })

    describe('when it is not present', () => {
      beforeEach(() => {
        delete transformedCompany.externalId
      })

      it('throws an error', async () => {
        expect(() => {
          ImportCompanyValidator.go(transformedCompany)
        }).to.throw('"externalId" is required')
      })
    })
  })
})

function _transformedCompany () {
  return {
    name: 'ACME',
    type: 'person',
    externalId: '1:1940'
  }
}
