'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const LicenceVersionValidator = require('../../../app/validators/import/licence-version.validator.js')

describe('Import Licence Version validator', () => {
  let transformedLicenceVersion

  beforeEach(async () => {
    transformedLicenceVersion = _transformedLicenceVersion()
  })

  describe('when valid data is provided', () => {
    it('does not throw an error', () => {
      expect(() => {
        LicenceVersionValidator.go(transformedLicenceVersion)
      }).to.not.throw()
    })
  })

  describe('the "endDate" property', () => {
    describe('when it is not a date or null', () => {
      beforeEach(() => {
        transformedLicenceVersion.endDate = 1
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionValidator.go(transformedLicenceVersion)
        }).to.throw('"endDate" must be a valid date')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceVersion.endDate = null
      })

      it('does not throw an error', () => {
        expect(() => {
          LicenceVersionValidator.go(transformedLicenceVersion)
        }).to.not.throw()
      })
    })
  })

  describe('the "externalId" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedLicenceVersion.externalId = 1
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionValidator.go(transformedLicenceVersion)
        }).to.throw('"externalId" must be a string')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceVersion.externalId = null
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionValidator.go(transformedLicenceVersion)
        }).to.throw('"externalId" must be a string')
      })
    })
  })

  describe('the "increment" property', () => {
    describe('when it is not a number', () => {
      beforeEach(() => {
        transformedLicenceVersion.increment = '1a'
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionValidator.go(transformedLicenceVersion)
        }).to.throw('"increment" must be a number')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceVersion.increment = null
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionValidator.go(transformedLicenceVersion)
        }).to.throw('"increment" must be a number')
      })
    })
  })

  describe('the "issue" property', () => {
    describe('when it is not a number', () => {
      beforeEach(() => {
        transformedLicenceVersion.issue = '1a'
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionValidator.go(transformedLicenceVersion)
        }).to.throw('"issue" must be a number')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceVersion.issue = null
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionValidator.go(transformedLicenceVersion)
        }).to.throw('"issue" must be a number')
      })
    })
  })

  describe('the "licenceVersionPurposes" property', () => {
    describe('when it is not an array', () => {
      beforeEach(() => {
        transformedLicenceVersion.licenceVersionPurposes = 1
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionValidator.go(transformedLicenceVersion)
        }).to.throw('"licenceVersionPurposes" must be an array')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceVersion.licenceVersionPurposes = null
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionValidator.go(transformedLicenceVersion)
        }).to.throw('"licenceVersionPurposes" must be an array')
      })
    })
  })

  describe('the "startDate" property', () => {
    describe('when it is not a date', () => {
      beforeEach(() => {
        transformedLicenceVersion.startDate = 1
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionValidator.go(transformedLicenceVersion)
        }).to.throw('"startDate" must be a valid date')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceVersion.startDate = null
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionValidator.go(transformedLicenceVersion)
        }).to.throw('"startDate" must be a valid date')
      })
    })
  })

  describe('the "status" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedLicenceVersion.status = 1
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionValidator.go(transformedLicenceVersion)
        }).to.throw('"status" must be one of [current, superseded]')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceVersion.status = null
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionValidator.go(transformedLicenceVersion)
        }).to.throw('"status" must be one of [current, superseded]')
      })
    })

    describe('when it is not a recognised status', () => {
      beforeEach(() => {
        transformedLicenceVersion.status = 'draft'
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionValidator.go(transformedLicenceVersion)
        }).to.throw('"status" must be one of [current, superseded]')
      })
    })
  })
})

function _transformedLicenceVersion () {
  return {
    endDate: new Date('2052-06-23'),
    externalId: '6:2113:100:0',
    increment: 0,
    issue: 100,
    licenceVersionPurposes: [],
    startDate: new Date('1999-01-01'),
    status: 'current'
  }
}
