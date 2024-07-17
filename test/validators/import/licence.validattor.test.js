'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')

// Thing under test
const ImportLicenceValidator = require('../../../app/validators/import/licence.validator.js')

describe.only('Import licence validator', () => {
  let licence

  const requiredFields = {
    licenceRef: generateLicenceRef(),
    naldRegionId: 1,
    startDate: '2001-01-01',
    waterUndertaker: true
  }

  before(async () => {
    licence = {
      ...requiredFields
    }
  })

  it('will not throw is all the required fields validations are met', () => {
    expect(() => {
      return ImportLicenceValidator.go({
        ...licence
      })
    }).to.not.throw()
  })

  describe('"expiredDate" property', () => {
    it('will return an error if "expiredDate" is not a string (can be null)', async () => {
      expect(() => {
        return ImportLicenceValidator.go({
          ...licence,
          expiredDate: 1
        })
      }).to.throw('"expiredDate" must be a string')
    })

    it('will return an error if "expiredDate" is not in the correct format', async () => {
      expect(() => {
        return ImportLicenceValidator.go({
          ...licence,
          expiredDate: '01/01/2001'
        })
      }).to.throw('"expiredDate" failed custom validation because date must be in the format YYYY-MM-DD')
    })

    it('will not return an error if "expiredDate" is null', async () => {
      expect(() => {
        return ImportLicenceValidator.go({
          ...licence,
          expiredDate: null
        })
      }).to.not.throw()
    })

    it('will not return an error if "expiredDate" is valid date string', async () => {
      expect(() => {
        return ImportLicenceValidator.go({
          ...licence,
          expiredDate: '2001-01-01'
        })
      }).to.not.throw()
    })
  })

  describe('"lapsedDate" property', () => {
    it('will return an error if "lapsedDate" is not a string (can be null)', async () => {
      expect(() => {
        return ImportLicenceValidator.go({
          ...licence,
          lapsedDate: 1
        })
      }).to.throw('"lapsedDate" must be a string')
    })

    it('will return an error if "lapsedDate" is not in the correct format', async () => {
      expect(() => {
        return ImportLicenceValidator.go({
          ...licence,
          lapsedDate: '01/01/2001'
        })
      }).to.throw('"lapsedDate" failed custom validation because date must be in the format YYYY-MM-DD')
    })

    it('will not return an error if "lapsedDate" is null', async () => {
      expect(() => {
        return ImportLicenceValidator.go({
          ...licence,
          lapsedDate: null
        })
      }).to.not.throw()
    })

    it('will not return an error if "lapsedDate" is valid date string', async () => {
      expect(() => {
        return ImportLicenceValidator.go({
          ...licence,
          lapsedDate: '2001-01-01'
        })
      }).to.not.throw()
    })
  })

  describe('"licenceRef" property', () => {
    it('will return an error - licenceRef - must be a string', async () => {
      expect(() => {
        return ImportLicenceValidator.go({
          licenceRef: 1
        })
      }).to.throw('"licenceRef" must be a string')
    })

    it('will return an error - licenceRef - is required', async () => {
      expect(() => { return ImportLicenceValidator.go({}) }).to.throw('"licenceRef" is required')
    })
  })
})
