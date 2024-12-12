'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const LicenceVersionPurposeValidator = require('../../../app/validators/import/licence-version-purpose.validator.js')

describe('Import Licence Version Purpose validator', () => {
  let transformedLicenceVersionPurpose

  beforeEach(async () => {
    transformedLicenceVersionPurpose = _transformedLicenceVersionPurpose()
  })

  describe('when valid data is provided', () => {
    it('does not throw an error', () => {
      expect(() => {
        LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
      }).to.not.throw()
    })
  })

  describe('the "abstractionPeriodEndDay" property', () => {
    describe('when it is not a number', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.abstractionPeriodEndDay = '31a'
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.throw('"abstractionPeriodEndDay" must be a number')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.abstractionPeriodEndDay = null
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.throw('"abstractionPeriodEndDay" must be a number')
      })
    })

    describe('when it is less than the minimum (1)', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.abstractionPeriodEndDay = 0
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.throw('"abstractionPeriodEndDay" must be greater than or equal to 1')
      })
    })

    describe('when "abstractionPeriodEndMonth"', () => {
      describe('is February (2)', () => {
        describe('and "abstractionPeriodEndDay" is more than the number of days in the month (29)', () => {
          beforeEach(() => {
            transformedLicenceVersionPurpose.abstractionPeriodEndMonth = 2
            transformedLicenceVersionPurpose.abstractionPeriodEndDay = 29
          })

          it('throws an error', async () => {
            expect(() => {
              LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
            }).to.throw('"abstractionPeriodEndDay" must be less than or equal to 28')
          })
        })
      })

      describe('is April (4)', () => {
        describe('and "abstractionPeriodEndDay" is more than the number of days in the month (30)', () => {
          beforeEach(() => {
            transformedLicenceVersionPurpose.abstractionPeriodEndMonth = 4
            transformedLicenceVersionPurpose.abstractionPeriodEndDay = 31
          })

          it('throws an error', async () => {
            expect(() => {
              LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
            }).to.throw('"abstractionPeriodEndDay" must be less than or equal to 30')
          })
        })
      })

      describe('is March (3)', () => {
        describe('and "abstractionPeriodEndDay" is more than the number of days in the month (31)', () => {
          beforeEach(() => {
            transformedLicenceVersionPurpose.abstractionPeriodEndMonth = 3
            transformedLicenceVersionPurpose.abstractionPeriodEndDay = 32
          })

          it('throws an error', async () => {
            expect(() => {
              LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
            }).to.throw('"abstractionPeriodEndDay" must be less than or equal to 31')
          })
        })
      })
    })
  })

  describe('the "abstractionPeriodEndMonth" property', () => {
    describe('when it is not a number', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.abstractionPeriodEndMonth = '12a'
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.throw('"abstractionPeriodEndMonth" must be a number')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.abstractionPeriodEndMonth = null
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.throw('"abstractionPeriodEndMonth" must be a number')
      })
    })

    describe('when it is less than the minimum (1)', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.abstractionPeriodEndMonth = 0
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.throw('"abstractionPeriodEndMonth" must be greater than or equal to 1')
      })
    })

    describe('when it is more than the maximum (12)', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.abstractionPeriodEndMonth = 13
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.throw('"abstractionPeriodEndMonth" must be less than or equal to 12')
      })
    })
  })

  describe('the "abstractionPeriodStartDay" property', () => {
    describe('when it is not a number', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.abstractionPeriodStartDay = '31a'
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.throw('"abstractionPeriodStartDay" must be a number')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.abstractionPeriodStartDay = null
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.throw('"abstractionPeriodStartDay" must be a number')
      })
    })

    describe('when it is less than the minimum (1)', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.abstractionPeriodStartDay = 0
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.throw('"abstractionPeriodStartDay" must be greater than or equal to 1')
      })
    })

    describe('when "abstractionPeriodStartMonth"', () => {
      describe('is February (2)', () => {
        describe('and "abstractionPeriodStartDay" is more than the number of days in the month (29)', () => {
          beforeEach(() => {
            transformedLicenceVersionPurpose.abstractionPeriodStartMonth = 2
            transformedLicenceVersionPurpose.abstractionPeriodStartDay = 29
          })

          it('throws an error', async () => {
            expect(() => {
              LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
            }).to.throw('"abstractionPeriodStartDay" must be less than or equal to 28')
          })
        })
      })

      describe('is April (4)', () => {
        describe('and "abstractionPeriodStartDay" is more than the number of days in the month (30)', () => {
          beforeEach(() => {
            transformedLicenceVersionPurpose.abstractionPeriodStartMonth = 4
            transformedLicenceVersionPurpose.abstractionPeriodStartDay = 31
          })

          it('throws an error', async () => {
            expect(() => {
              LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
            }).to.throw('"abstractionPeriodStartDay" must be less than or equal to 30')
          })
        })
      })

      describe('is March (3)', () => {
        describe('and "abstractionPeriodStartDay" is more than the number of days in the month (31)', () => {
          beforeEach(() => {
            transformedLicenceVersionPurpose.abstractionPeriodStartMonth = 3
            transformedLicenceVersionPurpose.abstractionPeriodStartDay = 32
          })

          it('throws an error', async () => {
            expect(() => {
              LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
            }).to.throw('"abstractionPeriodStartDay" must be less than or equal to 31')
          })
        })
      })
    })
  })

  describe('the "abstractionPeriodStartMonth" property', () => {
    describe('when it is not a number', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.abstractionPeriodStartMonth = '12a'
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.throw('"abstractionPeriodStartMonth" must be a number')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.abstractionPeriodStartMonth = null
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.throw('"abstractionPeriodStartMonth" must be a number')
      })
    })

    describe('when it is less than the minimum (1)', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.abstractionPeriodStartMonth = 0
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.throw('"abstractionPeriodStartMonth" must be greater than or equal to 1')
      })
    })

    describe('when it is more than the maximum (12)', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.abstractionPeriodStartMonth = 13
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.throw('"abstractionPeriodStartMonth" must be less than or equal to 12')
      })
    })
  })

  describe('the "annualQuantity" property', () => {
    describe('when it is not a number', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.annualQuantity = '545520.1a'
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.throw('"annualQuantity" must be a number')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.annualQuantity = null
      })

      it('does not throw an error', () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.not.throw()
      })
    })
  })

  describe('the "dailyQuantity" property', () => {
    describe('when it is not a number', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.dailyQuantity = '1500.2a'
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.throw('"dailyQuantity" must be a number')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.dailyQuantity = null
      })

      it('does not throw an error', () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.not.throw()
      })
    })
  })

  describe('the "externalId" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.externalId = 1
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.throw('"externalId" must be a string')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.externalId = null
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.throw('"externalId" must be a string')
      })
    })
  })

  describe('the "hourlyQuantity" property', () => {
    describe('when it is not a number', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.hourlyQuantity = '140.929a'
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.throw('"hourlyQuantity" must be a number')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.hourlyQuantity = null
      })

      it('does not throw an error', () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.not.throw()
      })
    })
  })

  describe('the "instantQuantity" property', () => {
    describe('when it is not a number', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.instantQuantity = '1.1a'
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.throw('"instantQuantity" must be a number')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.instantQuantity = null
      })

      it('does not throw an error', () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.not.throw()
      })
    })
  })

  describe('the "notes" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.notes = 1
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.throw('"notes" must be a string')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.notes = null
      })

      it('does not throw an error', () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.not.throw()
      })
    })
  })

  describe('the "primaryPurposeId" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.primaryPurposeId = 1
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.throw('"primaryPurposeId" must be a string')
      })
    })

    describe('when it is not a valid GUID', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.primaryPurposeId = 'i am not a GUID'
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.throw('"primaryPurposeId" must be a valid GUID')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.primaryPurposeId = null
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.throw('"primaryPurposeId" must be a string')
      })
    })
  })

  describe('the "purposeId" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.purposeId = 1
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.throw('"purposeId" must be a string')
      })
    })

    describe('when it is not a valid GUID', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.purposeId = 'i am not a GUID'
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.throw('"purposeId" must be a valid GUID')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.purposeId = null
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.throw('"purposeId" must be a string')
      })
    })
  })

  describe('the "secondaryPurposeId" property', () => {
    describe('when it is not a string', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.secondaryPurposeId = 1
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.throw('"secondaryPurposeId" must be a string')
      })
    })

    describe('when it is not a valid GUID', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.secondaryPurposeId = 'i am not a GUID'
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.throw('"secondaryPurposeId" must be a valid GUID')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.secondaryPurposeId = null
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.throw('"secondaryPurposeId" must be a string')
      })
    })
  })

  describe('the "timeLimitedEndDate" property', () => {
    describe('when it is not a date or null', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.timeLimitedEndDate = 1
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.throw('"timeLimitedEndDate" must be a valid date')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.timeLimitedEndDate = null
      })

      it('does not throw an error', () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.not.throw()
      })
    })
  })

  describe('the "timeLimitedStartDate" property', () => {
    describe('when it is not a date or null', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.timeLimitedStartDate = 1
      })

      it('throws an error', async () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.throw('"timeLimitedStartDate" must be a valid date')
      })
    })

    describe('when it is null', () => {
      beforeEach(() => {
        transformedLicenceVersionPurpose.timeLimitedStartDate = null
      })

      it('does not throw an error', () => {
        expect(() => {
          LicenceVersionPurposeValidator.go(transformedLicenceVersionPurpose)
        }).to.not.throw()
      })
    })
  })
})

function _transformedLicenceVersionPurpose() {
  return {
    abstractionPeriodEndDay: 31,
    abstractionPeriodEndMonth: 3,
    abstractionPeriodStartDay: 1,
    abstractionPeriodStartMonth: 4,
    annualQuantity: 545520.1,
    dailyQuantity: 1500.2,
    externalId: '6:10000004',
    hourlyQuantity: 140.929,
    instantQuantity: 1.1,
    notes: 'This is a note',
    primaryPurposeId: '8d9d407c-3da7-4977-84a0-97738c9b44cc',
    purposeId: '025bfdc9-d7f4-46b5-a7e0-451dec1a34a6',
    secondaryPurposeId: '04bdc9f6-a4e7-41de-831c-9ebf15b92782',
    timeLimitedEndDate: new Date('1992-08-19'),
    timeLimitedStartDate: new Date('2052-06-23')
  }
}
