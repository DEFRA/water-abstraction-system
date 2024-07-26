'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { validLicenceRequiredOnly } = require('./_fixtures/valid-licence.fixture.js')

// Thing under test
const ImportLicenceValidator = require('../../../app/validators/import/licence.validator.js')

describe('Import licence validator', () => {
  let licence

  before(async () => {
    licence = {
      ...validLicenceRequiredOnly
    }
  })

  it('should not throw if all the required fields validations are met', () => {
    expect(() => {
      return ImportLicenceValidator.go({
        ...licence
      })
    }).to.not.throw()
  })

  describe('"expiredDate" property', () => {
    it('should throw an error if "expiredDate" is not a string or null', async () => {
      expect(() => {
        return ImportLicenceValidator.go({
          ...licence,
          expiredDate: 1
        })
      }).to.throw('"expiredDate" must be a valid date')
    })

    it('should throw an error if "expiredDate" does not meet ISO 8601', async () => {
      expect(() => {
        return ImportLicenceValidator.go({
          ...licence,
          expiredDate: '01/01/2001'
        })
      }).to.throw('"expiredDate" must be in ISO 8601 date format')
    })

    it('should not throw an error if "expiredDate" is null', async () => {
      expect(() => {
        return ImportLicenceValidator.go({
          ...licence,
          expiredDate: null
        })
      }).to.not.throw()
    })

    it('should not throw an error if "expiredDate" is valid date string', async () => {
      expect(() => {
        return ImportLicenceValidator.go({
          ...licence,
          expiredDate: '2001-01-01'
        })
      }).to.not.throw()
    })
  })

  describe('"lapsedDate" property', () => {
    it('should throw an error if "expiredDate" is not a string or null', async () => {
      expect(() => {
        return ImportLicenceValidator.go({
          ...licence,
          lapsedDate: 1
        })
      }).to.throw('"lapsedDate" must be a valid date')
    })

    it('should throw an error if "lapsedDate" does not meet ISO 8601', async () => {
      expect(() => {
        return ImportLicenceValidator.go({
          ...licence,
          lapsedDate: '01/01/2001'
        })
      }).to.throw('"lapsedDate" must be in ISO 8601 date format')
    })

    it('should not throw an error if "lapsedDate" is null', async () => {
      expect(() => {
        return ImportLicenceValidator.go({
          ...licence,
          lapsedDate: null
        })
      }).to.not.throw()
    })

    it('should not throw an error if "lapsedDate" is valid date string', async () => {
      expect(() => {
        return ImportLicenceValidator.go({
          ...licence,
          lapsedDate: '2001-01-01'
        })
      }).to.not.throw()
    })
  })

  describe('"licenceRef" property', () => {
    it('should throw an error - licenceRef - must be a string', async () => {
      expect(() => {
        return ImportLicenceValidator.go({
          licenceRef: 1
        })
      }).to.throw('"licenceRef" must be a string')
    })

    it('should throw an error - licenceRef - is required', async () => {
      expect(() => { return ImportLicenceValidator.go({}) }).to.throw('"licenceRef" is required')
    })
  })

  describe('"naldRegionId" property', () => {
    it('should throw an error - naldRegionId - must be a number', async () => {
      expect(() => {
        return ImportLicenceValidator.go({
          licenceRef: 'l',
          naldRegionId: 'one'
        })
      }).to.throw('"naldRegionId" must be a number')
    })

    it('should throw an error - naldRegionId - is required', async () => {
      expect(() => {
        return ImportLicenceValidator.go({
          licenceRef: 'l'
        })
      }).to.throw('"naldRegionId" is required')
    })
  })

  describe('"regions" property', () => {
    describe('"regions.regionalChargeArea" property', () => {
      it('should throw an error if "regions.regionalChargeArea" is not a string', async () => {
        expect(() => {
          return ImportLicenceValidator.go({
            ...licence,
            regions: { regionalChargeArea: 1 }
          })
        }).to.throw('"regions.regionalChargeArea" must be a string')
      })

      it('should not throw an error if "regions.regionalChargeArea" is a string', async () => {
        expect(() => {
          return ImportLicenceValidator.go({
            ...licence,
            regions: { regionalChargeArea: 'a string' }
          })
        }).to.not.throw()
      })
    })

    describe('"regions.localEnvironmentAgencyPlanCode" property', () => {
      it('should throw an error if "regions.localEnvironmentAgencyPlanCode" is not a string', async () => {
        expect(() => {
          return ImportLicenceValidator.go({
            ...licence,
            regions: { localEnvironmentAgencyPlanCode: 1 }
          })
        }).to.throw('"regions.localEnvironmentAgencyPlanCode" must be a string')
      })

      it('should not throw an error if "regions.regionalChargeArea" is a string', async () => {
        expect(() => {
          return ImportLicenceValidator.go({
            ...licence,
            regions: { localEnvironmentAgencyPlanCode: 'a string' }
          })
        }).to.not.throw()
      })
    })

    describe('"regions.historicalAreaCode" property', () => {
      it('should throw an error if "regions.historicalAreaCode" is not a string', async () => {
        expect(() => {
          return ImportLicenceValidator.go({
            ...licence,
            regions: { historicalAreaCode: 1 }
          })
        }).to.throw('"regions.historicalAreaCode" must be a string')
      })

      it('should not throw an error if "regions.historicalAreaCode" is a string', async () => {
        expect(() => {
          return ImportLicenceValidator.go({
            ...licence,
            regions: { historicalAreaCode: 'a string' }
          })
        }).to.not.throw()
      })
    })

    describe('"regions.standardUnitChargeCode" property', () => {
      it('should throw an error if "regions.standardUnitChargeCode" is not a string', async () => {
        expect(() => {
          return ImportLicenceValidator.go({
            ...licence,
            regions: { standardUnitChargeCode: 1 }
          })
        }).to.throw('"regions.standardUnitChargeCode" must be a string')
      })

      it('should not throw an error if "regions.standardUnitChargeCode" is a string', async () => {
        expect(() => {
          return ImportLicenceValidator.go({
            ...licence,
            regions: { standardUnitChargeCode: 'a string' }
          })
        }).to.not.throw()
      })
    })
  })

  describe('"revokedDate" property', () => {
    it('should throw an error if "revokedDate" is not a string or null', async () => {
      expect(() => {
        return ImportLicenceValidator.go({
          ...licence,
          revokedDate: 1
        })
      }).to.throw('"revokedDate" must be a valid date')
    })

    it('should throw an error if "revokedDate" does not meet ISO 8601', async () => {
      expect(() => {
        return ImportLicenceValidator.go({
          ...licence,
          revokedDate: '01/01/2001'
        })
      }).to.throw('"revokedDate" must be in ISO 8601 date format')
    })

    it('should not throw an error if "revokedDate" is null', async () => {
      expect(() => {
        return ImportLicenceValidator.go({
          ...licence,
          revokedDate: null
        })
      }).to.not.throw()
    })

    it('should not throw an error if "revokedDate" is valid date string', async () => {
      expect(() => {
        return ImportLicenceValidator.go({
          ...licence,
          revokedDate: '2001-01-01'
        })
      }).to.not.throw()
    })
  })

  describe('"startDate" property', () => {
    it('should throw an error if "startDate" is not a string', async () => {
      expect(() => {
        return ImportLicenceValidator.go({
          ...licence,
          startDate: 1
        })
      }).to.throw('"startDate" must be a valid date')
    })

    it('should throw an error if "startDate" does not meet ISO 8601', async () => {
      expect(() => {
        return ImportLicenceValidator.go({
          ...licence,
          startDate: '01/01/2001'
        })
      }).to.throw('"startDate" must be in ISO 8601 date format')
    })

    it('should throw an error if "startDate" is null', async () => {
      expect(() => {
        return ImportLicenceValidator.go({
          ...licence,
          startDate: null
        })
      }).to.throw('"startDate" must be a valid date')
    })

    it('should not throw an error if "startDate" is valid date string', async () => {
      expect(() => {
        return ImportLicenceValidator.go({
          ...licence,
          startDate: '2001-01-01'
        })
      }).to.not.throw()
    })
  })

  describe('"waterUndertaker" property', () => {
    it('should throw an error if "waterUndertaker" is not a boolean', async () => {
      expect(() => {
        return ImportLicenceValidator.go({
          ...licence,
          waterUndertaker: 1
        })
      }).to.throw('"waterUndertaker" must be a boolean')
    })

    it('should not throw an error if "waterUndertaker" is boolean', async () => {
      expect(() => {
        return ImportLicenceValidator.go({
          ...licence,
          waterUndertaker: true
        })
      }).to.not.throw()
    })
  })
})
