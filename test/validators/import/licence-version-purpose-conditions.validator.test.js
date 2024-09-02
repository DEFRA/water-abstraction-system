'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const LicenceVersionPurposeConditionsValidator = require('../../../app/validators/import/licence-version-purpose-condition.validator.js')

describe('Import Licence Version Purpose Conditions validator', () => {
  let transformedLicenceVersionPurposeCondition

  beforeEach(async () => {
    transformedLicenceVersionPurposeCondition = _licenceVersionPurposeConditionsValidatorCondition()
  })

  describe('when valid data is provided', () => {
    it('does not throw an error', () => {
      expect(() => {
        LicenceVersionPurposeConditionsValidator.go(transformedLicenceVersionPurposeCondition)
      }).to.not.throw()
    })
  })

  describe('the "licenceVersionPurposeConditionTypeId" property', () => {
    describe('when it is not on the object', () => {
      beforeEach(() => {
        delete transformedLicenceVersionPurposeCondition.licenceVersionPurposeConditionTypeId
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeConditionsValidator.go(transformedLicenceVersionPurposeCondition)
        }).to.throw('"licenceVersionPurposeConditionTypeId" is required')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceVersionPurposeCondition.licenceVersionPurposeConditionTypeId = null
      })

      it('throws an error', () => {
        expect(() => {
          LicenceVersionPurposeConditionsValidator.go(transformedLicenceVersionPurposeCondition)
        }).to.throw('"licenceVersionPurposeConditionTypeId" must be a string')
      })
    })

    describe('when it is not a guid', () => {
      beforeEach(() => {
        transformedLicenceVersionPurposeCondition.licenceVersionPurposeConditionTypeId = '123'
      })

      it('throws an error', () => {
        expect(() => {
          LicenceVersionPurposeConditionsValidator.go(transformedLicenceVersionPurposeCondition)
        }).to.throw('"licenceVersionPurposeConditionTypeId" must be a valid GUID')
      })
    })
  })

  describe('the "param1" property', () => {
    describe('when it is a number', () => {
      beforeEach(() => {
        transformedLicenceVersionPurposeCondition.param1 = 1
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeConditionsValidator.go(transformedLicenceVersionPurposeCondition)
        }).to.throw('"param1" must be a string')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceVersionPurposeCondition.param1 = null
      })

      it('does not throw an error', () => {
        expect(() => {
          LicenceVersionPurposeConditionsValidator.go(transformedLicenceVersionPurposeCondition)
        }).to.not.throw()
      })
    })
  })

  describe('the "param2" property', () => {
    describe('when it is a number', () => {
      beforeEach(() => {
        transformedLicenceVersionPurposeCondition.param2 = 1
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeConditionsValidator.go(transformedLicenceVersionPurposeCondition)
        }).to.throw('"param2" must be a string')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceVersionPurposeCondition.param2 = null
      })

      it('does not throw an error', () => {
        expect(() => {
          LicenceVersionPurposeConditionsValidator.go(transformedLicenceVersionPurposeCondition)
        }).to.not.throw()
      })
    })
  })

  describe('the "notes" property', () => {
    describe('when it is a number', () => {
      beforeEach(() => {
        transformedLicenceVersionPurposeCondition.notes = 1
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeConditionsValidator.go(transformedLicenceVersionPurposeCondition)
        }).to.throw('"notes" must be a string')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceVersionPurposeCondition.notes = null
      })

      it('does not throw an error', () => {
        expect(() => {
          LicenceVersionPurposeConditionsValidator.go(transformedLicenceVersionPurposeCondition)
        }).to.not.throw()
      })
    })
  })

  describe('the "externalId" property', () => {
    describe('when it is not on the object', () => {
      beforeEach(() => {
        delete transformedLicenceVersionPurposeCondition.externalId
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeConditionsValidator.go(transformedLicenceVersionPurposeCondition)
        }).to.throw('"externalId" is required')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceVersionPurposeCondition.externalId = null
      })

      it('throws an error', () => {
        expect(() => {
          LicenceVersionPurposeConditionsValidator.go(transformedLicenceVersionPurposeCondition)
        }).to.throw('"externalId" must be a string')
      })
    })
  })
})

function _licenceVersionPurposeConditionsValidatorCondition () {
  return {
    externalId: '6:100004',
    licenceVersionPurposeConditionTypeId: 'b10cc9d1-d46f-465d-a74a-26b2e567c699'
  }
}
