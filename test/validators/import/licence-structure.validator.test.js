'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const LicenceStructureValidator = require('../../../app/validators/import/licence-structure.validator.js')

describe('Import Licence Structure validator', () => {
  let transformedLicence

  beforeEach(() => {
    transformedLicence = _transformedLicence()
  })

  describe('when valid data is provided', () => {
    it('does not throw an error', () => {
      expect(() => {
        LicenceStructureValidator.go(transformedLicence)
      }).to.not.throw()
    })
  })

  describe('the "licenceVersions" property', () => {
    describe('when it is not an array', () => {
      beforeEach(() => {
        transformedLicence.licenceVersions = 1
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceStructureValidator.go(transformedLicence)
        }).to.throw('"licenceVersions" must be an array')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicence.licenceVersions = null
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceStructureValidator.go(transformedLicence)
        }).to.throw('"licenceVersions" must be an array')
      })
    })

    describe('when it is empty', () => {
      beforeEach(() => {
        transformedLicence.licenceVersions = []
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceStructureValidator.go(transformedLicence)
        }).to.throw('"licenceVersions" must contain at least 1 items')
      })
    })

    describe('and its "licenceVersionPurposes" property', () => {
      describe('when it is not an array', () => {
        beforeEach(() => {
          transformedLicence.licenceVersions[0].licenceVersionPurposes = 1
        })

        it('throws an error', async () => {
          expect(() => {
            LicenceStructureValidator.go(transformedLicence)
          }).to.throw('"licenceVersions[0].licenceVersionPurposes" must be an array')
        })
      })

      describe('when it is null', () => {
        beforeEach(() => {
          transformedLicence.licenceVersions[0].licenceVersionPurposes = null
        })

        it('throws an error', async () => {
          expect(() => {
            LicenceStructureValidator.go(transformedLicence)
          }).to.throw('"licenceVersions[0].licenceVersionPurposes" must be an array')
        })
      })

      describe('when it is empty', () => {
        beforeEach(() => {
          transformedLicence.licenceVersions[0].licenceVersionPurposes = []
        })

        it('throws an error', async () => {
          expect(() => {
            LicenceStructureValidator.go(transformedLicence)
          }).to.throw('"licenceVersions[0].licenceVersionPurposes" must contain at least 1 items')
        })
      })
    })
  })
})

function _transformedLicence() {
  return {
    licenceRef: '01/123',
    licenceVersions: [
      {
        externalId: '6:2113:100:0',
        licenceVersionPurposes: [
          {
            externalId: '6:10000004'
          },
          {
            externalId: '6:10000005'
          }
        ]
      }
    ]
  }
}
