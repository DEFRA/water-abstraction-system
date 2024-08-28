'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const LicenceVersionPurposeConditionsValidator = require('../../../app/validators/import/licence-version-purpose-condition.validator.js')

describe('Import Licence Version Purpose Conditions validator', () => {
  let transformedLicenceVersionPurposeConditions

  beforeEach(async () => {
    transformedLicenceVersionPurposeConditions = [_LicenceVersionPurposeConditionsValidatorCondition()]
  })

  describe('when valid data is provided', () => {
    it('does not throw an error', () => {
      expect(() => {
        LicenceVersionPurposeConditionsValidator.go(transformedLicenceVersionPurposeConditions)
      }).to.not.throw()
    })
  })

  describe('the "licenceVersionPurposeConditionTypeId" property', () => {
    describe('when it is not on the object', () => {
      beforeEach(() => {
        delete transformedLicenceVersionPurposeConditions[0].licenceVersionPurposeConditionTypeId
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeConditionsValidator.go(transformedLicenceVersionPurposeConditions)
        }).to.throw('"[0].licenceVersionPurposeConditionTypeId" is required')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceVersionPurposeConditions[0].licenceVersionPurposeConditionTypeId = null
      })

      it('throws an error', () => {
        expect(() => {
          LicenceVersionPurposeConditionsValidator.go(transformedLicenceVersionPurposeConditions)
        }).to.throw('"[0].licenceVersionPurposeConditionTypeId" must be a string')
      })
    })

    describe('when it is not a guid', () => {
      beforeEach(() => {
        transformedLicenceVersionPurposeConditions[0].licenceVersionPurposeConditionTypeId = '123'
      })

      it('throws an error', () => {
        expect(() => {
          LicenceVersionPurposeConditionsValidator.go(transformedLicenceVersionPurposeConditions)
        }).to.throw('"[0].licenceVersionPurposeConditionTypeId" must be a valid GUID')
      })
    })
  })

  describe('the "param1" property', () => {
    describe('when it is a number', () => {
      beforeEach(() => {
        transformedLicenceVersionPurposeConditions[0].param1 = 1
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeConditionsValidator.go(transformedLicenceVersionPurposeConditions)
        }).to.throw('"[0].param1" must be a string')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceVersionPurposeConditions[0].param1 = null
      })

      it('does not throw an error', () => {
        expect(() => {
          LicenceVersionPurposeConditionsValidator.go(transformedLicenceVersionPurposeConditions)
        }).to.not.throw()
      })
    })
  })

  describe('the "param2" property', () => {
    describe('when it is a number', () => {
      beforeEach(() => {
        transformedLicenceVersionPurposeConditions[0].param2 = 1
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeConditionsValidator.go(transformedLicenceVersionPurposeConditions)
        }).to.throw('"[0].param2" must be a string')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceVersionPurposeConditions[0].param2 = null
      })

      it('does not throw an error', () => {
        expect(() => {
          LicenceVersionPurposeConditionsValidator.go(transformedLicenceVersionPurposeConditions)
        }).to.not.throw()
      })
    })
  })

  describe('the "notes" property', () => {
    describe('when it is a number', () => {
      beforeEach(() => {
        transformedLicenceVersionPurposeConditions[0].notes = 1
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeConditionsValidator.go(transformedLicenceVersionPurposeConditions)
        }).to.throw('"[0].notes" must be a string')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceVersionPurposeConditions[0].notes = null
      })

      it('does not throw an error', () => {
        expect(() => {
          LicenceVersionPurposeConditionsValidator.go(transformedLicenceVersionPurposeConditions)
        }).to.not.throw()
      })
    })
  })

  describe('the "externalId" property', () => {
    describe('when it is not on the object', () => {
      beforeEach(() => {
        delete transformedLicenceVersionPurposeConditions[0].externalId
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeConditionsValidator.go(transformedLicenceVersionPurposeConditions)
        }).to.throw('"[0].externalId" is required')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceVersionPurposeConditions[0].externalId = null
      })

      it('throws an error', () => {
        expect(() => {
          LicenceVersionPurposeConditionsValidator.go(transformedLicenceVersionPurposeConditions)
        }).to.throw('"[0].externalId" must be a string')
      })
    })
  })
})

function _LicenceVersionPurposeConditionsValidatorCondition () {
  return {
    externalId: '6:100004',
    licenceVersionPurposeConditionTypeId: 'b10cc9d1-d46f-465d-a74a-26b2e567c699'
  }
}
