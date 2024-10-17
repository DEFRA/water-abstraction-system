'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')

// Thing under test
const LicenceValidator = require('../../../app/validators/import/licence.validator.js')

describe('Import Licence validator', () => {
  let transformedLicence

  beforeEach(async () => {
    transformedLicence = _transformedLicence()
  })

  describe('when valid data is provided', () => {
    it('does not throw an error', () => {
      expect(() => {
        LicenceValidator.go(transformedLicence)
      }).to.not.throw()
    })
  })

  describe('the "expiredDate" property', () => {
    describe('when it is not a date or null', () => {
      beforeEach(() => {
        transformedLicence.expiredDate = 1
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceValidator.go(transformedLicence)
        }).to.throw('"expiredDate" must be a valid date')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicence.expiredDate = null
      })

      it('does not throw an error', () => {
        expect(() => {
          LicenceValidator.go(transformedLicence)
        }).to.not.throw()
      })
    })
  })

  describe('the "lapsedDate" property', () => {
    describe('when it is not a date or null', () => {
      beforeEach(() => {
        transformedLicence.lapsedDate = 1
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceValidator.go(transformedLicence)
        }).to.throw('"lapsedDate" must be a valid date')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicence.lapsedDate = null
      })

      it('does not throw an error', () => {
        expect(() => {
          LicenceValidator.go(transformedLicence)
        }).to.not.throw()
      })
    })
  })

  describe('the "licenceDocumentRoles" property', () => {
    describe('when it is not an array', () => {
      beforeEach(() => {
        transformedLicence.licenceDocumentRoles = 1
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceValidator.go(transformedLicence)
        }).to.throw('"licenceDocumentRoles" must be an array')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicence.licenceDocumentRoles = null
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceValidator.go(transformedLicence)
        }).to.throw('"licenceDocumentRoles" must be an array')
      })
    })
  })

  describe('the "licenceRef" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedLicence.licenceRef = 1
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceValidator.go(transformedLicence)
        }).to.throw('"licenceRef" must be a string')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicence.licenceRef = null
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceValidator.go(transformedLicence)
        }).to.throw('"licenceRef" must be a string')
      })
    })

    describe('when it contains whitespace', () => {
      beforeEach(() => {
        transformedLicence.licenceRef = `${transformedLicence.licenceRef} `
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceValidator.go(transformedLicence)
        }).to.throw('"licenceRef" must not have leading or trailing whitespace')
      })
    })
  })

  describe('the "licenceVersions" property', () => {
    describe('when it is not an array', () => {
      beforeEach(() => {
        transformedLicence.licenceVersions = 1
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceValidator.go(transformedLicence)
        }).to.throw('"licenceVersions" must be an array')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicence.licenceVersions = null
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceValidator.go(transformedLicence)
        }).to.throw('"licenceVersions" must be an array')
      })
    })
  })

  describe('the "regionId" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedLicence.regionId = 1
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceValidator.go(transformedLicence)
        }).to.throw('"regionId" must be a string')
      })
    })

    describe('when it is not a valid GUID', () => {
      beforeEach(() => {
        transformedLicence.regionId = 'i am not a GUID'
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceValidator.go(transformedLicence)
        }).to.throw('"regionId" must be a valid GUID')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicence.regionId = null
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceValidator.go(transformedLicence)
        }).to.throw('"regionId" must be a string')
      })
    })
  })

  describe('the "regions" property', () => {
    describe('when it is not an object', () => {
      beforeEach(() => {
        transformedLicence.regions = 1
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceValidator.go(transformedLicence)
        }).to.throw('"regions" must be of type object')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicence.regions = null
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceValidator.go(transformedLicence)
        }).to.throw('"regions" must be of type object')
      })
    })

    describe('and its "regionalChargeArea" property', () => {
      describe('when it is not a string', () => {
        beforeEach(() => {
          transformedLicence.regions.regionalChargeArea = 1
        })

        it('throws an error', async () => {
          expect(() => {
            LicenceValidator.go(transformedLicence)
          }).to.throw('"regions.regionalChargeArea" must be a string')
        })
      })

      describe('when it is null', () => {
        beforeEach(() => {
          transformedLicence.regions.regionalChargeArea = null
        })

        it('throws an error', async () => {
          expect(() => {
            LicenceValidator.go(transformedLicence)
          }).to.throw('"regions.regionalChargeArea" must be a string')
        })
      })
    })

    describe('and its "localEnvironmentAgencyPlanCode" property', () => {
      describe('when it is not a string', () => {
        beforeEach(() => {
          transformedLicence.regions.localEnvironmentAgencyPlanCode = 1
        })

        it('throws an error', async () => {
          expect(() => {
            LicenceValidator.go(transformedLicence)
          }).to.throw('"regions.localEnvironmentAgencyPlanCode" must be a string')
        })
      })

      describe('when it is null', () => {
        beforeEach(() => {
          transformedLicence.regions.localEnvironmentAgencyPlanCode = null
        })

        it('throws an error', async () => {
          expect(() => {
            LicenceValidator.go(transformedLicence)
          }).to.throw('"regions.localEnvironmentAgencyPlanCode" must be a string')
        })
      })
    })

    describe('and its "historicalAreaCode" property', () => {
      describe('when it is not a string', () => {
        beforeEach(() => {
          transformedLicence.regions.historicalAreaCode = 1
        })

        it('throws an error', async () => {
          expect(() => {
            LicenceValidator.go(transformedLicence)
          }).to.throw('"regions.historicalAreaCode" must be a string')
        })
      })

      describe('when it is null', () => {
        beforeEach(() => {
          transformedLicence.regions.historicalAreaCode = null
        })

        it('throws an error', async () => {
          expect(() => {
            LicenceValidator.go(transformedLicence)
          }).to.throw('"regions.historicalAreaCode" must be a string')
        })
      })
    })

    describe('and its "standardUnitChargeCode" property', () => {
      describe('when it is not a string', () => {
        beforeEach(() => {
          transformedLicence.regions.standardUnitChargeCode = 1
        })

        it('throws an error', async () => {
          expect(() => {
            LicenceValidator.go(transformedLicence)
          }).to.throw('"regions.standardUnitChargeCode" must be a string')
        })
      })

      describe('when it is null', () => {
        beforeEach(() => {
          transformedLicence.regions.standardUnitChargeCode = null
        })

        it('throws an error', async () => {
          expect(() => {
            LicenceValidator.go(transformedLicence)
          }).to.throw('"regions.standardUnitChargeCode" must be a string')
        })
      })
    })
  })

  describe('the "revokedDate" property', () => {
    describe('when it is not a date or null', () => {
      beforeEach(() => {
        transformedLicence.revokedDate = 1
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceValidator.go(transformedLicence)
        }).to.throw('"revokedDate" must be a valid date')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicence.revokedDate = null
      })

      it('does not throw an error', () => {
        expect(() => {
          LicenceValidator.go(transformedLicence)
        }).to.not.throw()
      })
    })
  })

  describe('the "startDate" property', () => {
    describe('when it is not a date', () => {
      beforeEach(() => {
        transformedLicence.startDate = 1
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceValidator.go(transformedLicence)
        }).to.throw('"startDate" must be a valid date')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicence.startDate = null
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceValidator.go(transformedLicence)
        }).to.throw('"startDate" must be a valid date')
      })
    })
  })

  describe('the "waterUndertaker" property', () => {
    describe('when it is not a boolean', () => {
      beforeEach(() => {
        transformedLicence.waterUndertaker = 1
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceValidator.go(transformedLicence)
        }).to.throw('"waterUndertaker" must be a boolean')
      })
    })

    describe('when it is a boolean', () => {
      it('does not throw an error', () => {
        expect(() => {
          LicenceValidator.go(transformedLicence)
        }).to.not.throw()
      })
    })
  })
})

function _transformedLicence () {
  return {
    expiredDate: new Date('2052-06-23'),
    lapsedDate: new Date('2050-07-24'),
    licenceDocumentRoles: [],
    licenceRef: generateLicenceRef(),
    licenceVersions: [],
    regionId: '82d8c1b7-0eed-43a7-a5f9-4e397c08e17e',
    regions: {
      historicalAreaCode: 'KAEA',
      regionalChargeArea: 'Southern',
      standardUnitChargeCode: 'SUCSO',
      localEnvironmentAgencyPlanCode: 'LEME'
    },
    revokedDate: new Date('2049-08-25'),
    startDate: new Date('1992-08-19'),
    waterUndertaker: false
  }
}
