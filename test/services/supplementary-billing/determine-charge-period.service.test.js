'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const DetermineChargePeriodService = require('../../../app/services/supplementary-billing/determine-charge-period.service.js')

describe('Determine charge period service', () => {
  const financialYear = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31'),
    yearEnding: 2023
  }
  let chargeVersion

  // 1st charge version - CV
  // 2nd financial year - FY

  // neither overlaps
  //   - CV has no end date

  describe('charge version starts inside the financial period', () => {
    beforeEach(() => {
      chargeVersion = {
        startDate: new Date('2022-05-01'),
        endDate: null
      }
    })

    describe('and the charge version has an end date', () => {
      beforeEach(() => {
        chargeVersion.endDate = new Date('2022-05-31')
      })

      it('returns the charge version start and end dates', () => {
        const result = DetermineChargePeriodService.go(chargeVersion, financialYear.yearEnding)

        expect(result.startDate).to.equal(chargeVersion.startDate)
        expect(result.endDate).to.equal(chargeVersion.endDate)
      })
    })

    describe('and the charge version does not have an end date', () => {
      it('returns the charge version start date and financial year end date', () => {
        const result = DetermineChargePeriodService.go(chargeVersion, financialYear.yearEnding)

        expect(result.startDate).to.equal(chargeVersion.startDate)
        expect(result.endDate).to.equal(financialYear.endDate)
      })
    })
  })

  describe('financial period starts inside the charge version', () => {
    beforeEach(() => {
      chargeVersion = {
        startDate: new Date('2022-02-01'),
        endDate: null
      }
    })

    describe('and the charge version has an end date', () => {
      beforeEach(() => {
        chargeVersion.endDate = new Date('2023-05-31')
      })

      it('returns the financial start and end dates', () => {
        const result = DetermineChargePeriodService.go(chargeVersion, financialYear.yearEnding)

        expect(result.startDate).to.equal(financialYear.startDate)
        expect(result.endDate).to.equal(financialYear.endDate)
      })
    })

    describe('and the charge version does not have an end date', () => {
      it('returns the financial start and end dates', () => {
        const result = DetermineChargePeriodService.go(chargeVersion, financialYear.yearEnding)

        expect(result.startDate).to.equal(financialYear.startDate)
        expect(result.endDate).to.equal(financialYear.endDate)
      })
    })
  })

  describe('charge version starts before the financial period', () => {
    beforeEach(() => {
      chargeVersion = {
        startDate: new Date('2022-02-01'),
        endDate: null
      }
    })

    describe('and the charge version has an end date that is inside the financial period', () => {
      beforeEach(() => {
        chargeVersion.endDate = new Date('2022-05-31')
      })

      it('returns the financial start and charge version end date', () => {
        const result = DetermineChargePeriodService.go(chargeVersion, financialYear.yearEnding)

        expect(result.startDate).to.equal(financialYear.startDate)
        expect(result.endDate).to.equal(chargeVersion.endDate)
      })
    })

    describe('and the charge version does not have an end date', () => {
      it('returns the financial start and end dates', () => {
        const result = DetermineChargePeriodService.go(chargeVersion, financialYear.yearEnding)

        expect(result.startDate).to.equal(financialYear.startDate)
        expect(result.endDate).to.equal(financialYear.endDate)
      })
    })
  })

  describe('financial period starts before the charge version', () => {
    beforeEach(() => {
      chargeVersion = {
        startDate: new Date('2022-05-01'),
        endDate: null
      }
    })

    describe('and the charge version has an end date that is outside the financial period', () => {
      beforeEach(() => {
        chargeVersion.endDate = new Date('2023-05-31')
      })

      it('returns the charge version start date and financial period end date', () => {
        const result = DetermineChargePeriodService.go(chargeVersion, financialYear.yearEnding)

        expect(result.startDate).to.equal(chargeVersion.startDate)
        expect(result.endDate).to.equal(financialYear.endDate)
      })
    })

    describe('and the charge version does not have an end date', () => {
      it('returns the charge version start date and financial period end date', () => {
        const result = DetermineChargePeriodService.go(chargeVersion, financialYear.yearEnding)

        expect(result.startDate).to.equal(chargeVersion.startDate)
        expect(result.endDate).to.equal(financialYear.endDate)
      })
    })
  })

  describe('neither period overlaps', () => {
    describe('because the charge version start date is after the financial period', () => {
      beforeEach(() => {
        chargeVersion = {
          startDate: new Date('2023-05-01'),
          endDate: null
        }
      })

      it('throws an error', () => {
        expect(() => DetermineChargePeriodService.go(chargeVersion, financialYear.yearEnding)).to.throw()
      })
    })

    describe('because the charge version end date is before the financial period', () => {
      beforeEach(() => {
        chargeVersion = {
          startDate: new Date('2021-05-01'),
          endDate: new Date('2021-05-31')
        }
      })

      it('throws an error', () => {
        expect(() => DetermineChargePeriodService.go(chargeVersion, financialYear.yearEnding)).to.throw()
      })
    })
  })
})
