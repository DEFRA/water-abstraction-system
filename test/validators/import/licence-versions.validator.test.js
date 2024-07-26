'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const FixtureValidLicenceVersions = require('./_fixtures/valid-licence-versions.fixture.js')

// Thing under test
const ImportLicenceVersionsValidator = require('../../../app/validators/import/licence-versions.validator.js')

describe('Import licence versions validator', () => {
  let licenceVersion
  let licenceVersionPurpose
  let licenceVersionPurposes
  let licenceVersionsAndPurposes

  before(async () => {
    licenceVersion = FixtureValidLicenceVersions.validLicenceVersion
    licenceVersionPurpose = FixtureValidLicenceVersions.validLicencePurposes[0]
    licenceVersionPurposes = FixtureValidLicenceVersions.validLicencePurposes
    licenceVersionsAndPurposes = [...FixtureValidLicenceVersions.validLicenceVersionsAndPurposes]
  })

  it('should not throw if all the required fields validations are met', () => {
    expect(() => {
      return ImportLicenceVersionsValidator.go(licenceVersionsAndPurposes)
    }).to.not.throw()
  })

  describe('the "version"', () => {
    describe('"endDate" property', () => {
      it('should throw an error if "endDate" is not a valid date or null', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes,
              endDate: 1
            }
          ])
        }).to.throw('"[0].endDate" must be a valid date')
      })

      it('should throw an error if "endDate" does not meet ISO 8601', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes,
              endDate: '01/01/2001'
            }
          ])
        }).to.throw('"[0].endDate" must be in ISO 8601 date format')
      })

      it('should not throw an error if "endDate" is null', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes,
              endDate: null
            }
          ])
        }).to.not.throw()
      })

      it('should not throw an error if "endDate" is valid date', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes,
              endDate: '2001-01-01'
            }
          ])
        }).to.not.throw()
      })
    })

    describe('"externalId" property', () => {
      it('should throw an error - externalId - must be a string', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes,
              externalId: null
            }
          ])
        }).to.throw('"[0].externalId" must be a string')
      })

      it('should throw an error - externalId - is required', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              endDate: null
            }
          ])
        }).to.throw('"[0].externalId" is required')
      })

      it('should not throw an error if "externalId" is a string', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes
            }
          ])
        }).to.not.throw()
      })
    })

    describe('"increment" property', () => {
      it('should throw an error - increment - must be a number', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes,
              increment: '1a'
            }
          ])
        }).to.throw('"[0].increment" must be a number')
      })

      it('should throw an error - increment - is required', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              endDate: null,
              externalId: '1:2:3'
            }
          ])
        }).to.throw('"[0].increment" is required')
      })

      it('should not throw an error if "increment" is a number', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes
            }
          ])
        }).to.not.throw()
      })
    })

    describe('"issue" property', () => {
      it('should throw an error - issue - must be a number', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes,
              issue: '1a'
            }
          ])
        }).to.throw('"[0].issue" must be a number')
      })

      it('should throw an error - issue - is required', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              endDate: null,
              externalId: '1:2:3',
              increment: 1
            }
          ])
        }).to.throw('"[0].issue" is required')
      })

      it('should not throw an error if "issue" is a number', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes
            }
          ])
        }).to.not.throw()
      })
    })

    describe('"status" property', () => {
      it('should throw an error - status - must be a string', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes,
              status: 1
            }
          ])
        }).to.throw('"[0].status" must be a string')
      })

      it('should throw an error - status - is required', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              endDate: null,
              externalId: '1:2:3',
              increment: 1,
              issue: 1,
              startDate: '2001-01-01'
            }
          ])
        }).to.throw('"[0].status" is required')
      })

      it('should throw an error - status - is not a valid status', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes,
              status: 'draft'
            }
          ])
        }).to.throw('"[0].status" failed custom validation because status must be one of current,superseded')
      })

      it('should not throw an error if "status" is a valid status', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes
            }
          ])
        }).to.not.throw()
      })
    })

    describe('"startDate" property', () => {
      it('should throw an error if "startDate" is not a valid date', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes,
              startDate: 1
            }
          ])
        }).to.throw('"[0].startDate" must be a valid date')
      })

      it('should throw an error if "startDate" does not meet ISO 8601', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes,
              startDate: '01/01/2001'
            }
          ])
        }).to.throw('"[0].startDate" must be in ISO 8601 date format')
      })

      it('should throw an error if "startDate" is null', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes,
              startDate: null
            }
          ])
        }).to.throw('"[0].startDate" must be a valid date')
      })

      it('should not throw an error if "startDate" is valid date string', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes,
              startDate: '2001-01-01'
            }
          ])
        }).to.not.throw()
      })
    })

    // describe('"purposes" property', () => {
    //
    // })
  })
})
