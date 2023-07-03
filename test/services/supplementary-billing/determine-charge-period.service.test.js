'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const DetermineChargePeriodService = require('../../../app/services/supplementary-billing/determine-charge-period.service.js')

describe('Determine charge period service', () => {
  const billingPeriod = {
    startDate: new Date('2023-04-01'),
    endDate: new Date('2024-03-31')
  }
  let chargeVersion

  describe('charge version starts inside the billing period', () => {
    beforeEach(() => {
      chargeVersion = {
        startDate: new Date('2023-05-01'),
        endDate: null,
        licence: { startDate: new Date('2023-01-01') }
      }
    })

    describe('and the charge version has an end date', () => {
      beforeEach(() => {
        chargeVersion.endDate = new Date('2023-05-31')
      })

      it('returns the charge version start and end dates', () => {
        const result = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

        expect(result.startDate).to.equal(chargeVersion.startDate)
        expect(result.endDate).to.equal(chargeVersion.endDate)
      })
    })

    describe('and the charge version does not have an end date', () => {
      it('returns the charge version start date and billing period end date', () => {
        const result = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

        expect(result.startDate).to.equal(chargeVersion.startDate)
        expect(result.endDate).to.equal(billingPeriod.endDate)
      })
    })
  })

  describe('billing period starts inside the charge version', () => {
    beforeEach(() => {
      chargeVersion = {
        startDate: new Date('2023-02-01'),
        endDate: null,
        licence: { startDate: new Date('2023-01-01') }
      }
    })

    describe('and the charge version has an end date', () => {
      beforeEach(() => {
        chargeVersion.endDate = new Date('2024-05-31')
      })

      it('returns the billing period start and end dates', () => {
        const result = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

        expect(result.startDate).to.equal(billingPeriod.startDate)
        expect(result.endDate).to.equal(billingPeriod.endDate)
      })
    })

    describe('and the charge version does not have an end date', () => {
      it('returns the billing period start and end dates', () => {
        const result = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

        expect(result.startDate).to.equal(billingPeriod.startDate)
        expect(result.endDate).to.equal(billingPeriod.endDate)
      })
    })
  })

  describe('charge version starts before the billing period', () => {
    beforeEach(() => {
      chargeVersion = {
        startDate: new Date('2023-02-01'),
        endDate: null
      }
    })

    describe('and the charge version has an end date that is inside the billing period', () => {
      beforeEach(() => {
        chargeVersion.licence = { startDate: new Date('2023-01-01') }
        chargeVersion.endDate = new Date('2023-05-31')
      })

      it('returns the billing period start and charge version end date', () => {
        const result = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

        expect(result.startDate).to.equal(billingPeriod.startDate)
        expect(result.endDate).to.equal(chargeVersion.endDate)
      })
    })

    describe('and the charge version does not have an end date', () => {
      beforeEach(() => {
        chargeVersion.licence = { startDate: new Date('2023-01-01') }
      })

      it('returns the billing period start and end dates', () => {
        const result = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

        expect(result.startDate).to.equal(billingPeriod.startDate)
        expect(result.endDate).to.equal(billingPeriod.endDate)
      })
    })

    describe('and the licence start date is after the charge versions and inside the billing period', () => {
      beforeEach(() => {
        chargeVersion.licence = { startDate: new Date('2023-08-31') }
      })

      it('returns the licence start and billing period end date', () => {
        const result = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

        expect(result.startDate).to.equal(chargeVersion.licence.startDate)
        expect(result.endDate).to.equal(billingPeriod.endDate)
      })
    })

    describe('and the licence revoked date', () => {
      describe('is inside the billing period', () => {
        beforeEach(() => {
          chargeVersion.licence = { startDate: new Date('2023-01-01'), revokedDate: new Date('2023-08-01') }
        })

        it('returns the billing period start and licence revoked end date', () => {
          const result = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

          expect(result.startDate).to.equal(billingPeriod.startDate)
          expect(result.endDate).to.equal(chargeVersion.licence.revokedDate)
        })
      })

      describe('is before the billing period', () => {
        beforeEach(() => {
          chargeVersion.licence = { startDate: new Date('2023-01-01'), revokedDate: new Date('2023-02-01') }
        })

        it('returns null values for the dates', () => {
          const result = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

          expect(result.startDate).to.be.null()
          expect(result.endDate).to.be.null()
        })
      })
    })

    describe('and the licence lapsed date', () => {
      describe('is inside the billing period', () => {
        beforeEach(() => {
          chargeVersion.licence = { startDate: new Date('2023-01-01'), lapsedDate: new Date('2023-08-31') }
        })

        it('returns the billing period start and licence lapsed end date', () => {
          const result = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

          expect(result.startDate).to.equal(billingPeriod.startDate)
          expect(result.endDate).to.equal(chargeVersion.licence.lapsedDate)
        })
      })

      describe('is before the billing period', () => {
        beforeEach(() => {
          chargeVersion.licence = { startDate: new Date('2023-01-01'), lapsedDate: new Date('2023-02-31') }
        })

        it('returns null values for the dates', () => {
          const result = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

          expect(result.startDate).to.be.null()
          expect(result.endDate).to.be.null()
        })
      })
    })

    describe('and the licence expired date', () => {
      describe('is inside the billing period', () => {
        beforeEach(() => {
          chargeVersion.licence = { startDate: new Date('2023-01-01'), expiredDate: new Date('2023-07-01') }
        })

        it('returns the billing period start and licence expired end date', () => {
          const result = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

          expect(result.startDate).to.equal(billingPeriod.startDate)
          expect(result.endDate).to.equal(chargeVersion.licence.expiredDate)
        })
      })

      describe('is before the billing period', () => {
        beforeEach(() => {
          chargeVersion.licence = { startDate: new Date('2023-01-01'), lapsedDate: new Date('2023-02-31') }
        })

        it('returns null values for the dates', () => {
          const result = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

          expect(result.startDate).to.be.null()
          expect(result.endDate).to.be.null()
        })
      })
    })
  })

  describe('billing period starts before the charge version', () => {
    beforeEach(() => {
      chargeVersion = {
        startDate: new Date('2023-05-01'),
        endDate: null,
        licence: { startDate: new Date('2023-01-01') }
      }
    })

    describe('and the charge version has an end date that is outside the billing period', () => {
      beforeEach(() => {
        chargeVersion.endDate = new Date('2024-05-31')
      })

      it('returns the charge version start date and billing period end date', () => {
        const result = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

        expect(result.startDate).to.equal(chargeVersion.startDate)
        expect(result.endDate).to.equal(billingPeriod.endDate)
      })
    })

    describe('and the charge version does not have an end date', () => {
      it('returns the charge version start date and billing period end date', () => {
        const result = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

        expect(result.startDate).to.equal(chargeVersion.startDate)
        expect(result.endDate).to.equal(billingPeriod.endDate)
      })
    })
  })

  describe('neither period overlaps', () => {
    describe('because the charge version start date is after the billing period', () => {
      beforeEach(() => {
        chargeVersion = {
          startDate: new Date('2024-05-01'),
          endDate: null,
          licence: { startDate: new Date('2018-01-01') }
        }
      })

      it('returns null values for the dates', () => {
        const result = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

        expect(result.startDate).to.be.null()
        expect(result.endDate).to.be.null()
      })
    })

    describe('because the charge version end date is before the billing period', () => {
      beforeEach(() => {
        chargeVersion = {
          startDate: new Date('2022-05-01'),
          endDate: new Date('2022-05-31'),
          licence: { startDate: new Date('2018-01-01') }
        }
      })

      it('returns null values for the dates', () => {
        const result = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

        expect(result.startDate).to.be.null()
        expect(result.endDate).to.be.null()
      })
    })
  })
})
