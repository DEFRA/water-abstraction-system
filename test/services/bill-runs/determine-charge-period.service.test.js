'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, beforeEach } = require('node:test')
const { expect } = Code

// Thing under test
const DetermineChargePeriodService = require('../../../app/services/bill-runs/determine-charge-period.service.js')

describe('Determine charge period service', () => {
  const billingPeriod = {
    startDate: new Date('2023-04-01'),
    endDate: new Date('2024-03-31')
  }
  let chargeVersion

  describe('the charge version starts before the billing period', () => {
    describe('and has an end date that is inside the billing period', () => {
      beforeEach(() => {
        chargeVersion = {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2023-05-31'),
          licence: { startDate: new Date('2017-01-01') }
        }
      })

      it('returns the billing period start and charge version end dates', () => {
        const result = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

        expect(result.startDate).to.equal(billingPeriod.startDate)
        expect(result.endDate).to.equal(chargeVersion.endDate)
      })
    })

    describe('and does not have an end date', () => {
      beforeEach(() => {
        chargeVersion = {
          startDate: new Date('2022-04-01'),
          endDate: null,
          licence: { startDate: new Date('2017-01-01') }
        }
      })

      it('returns the billing period start and end dates', () => {
        const result = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

        expect(result.startDate).to.equal(billingPeriod.startDate)
        expect(result.endDate).to.equal(billingPeriod.endDate)
      })
    })

    describe('and has an end date that is after the billing period', () => {
      beforeEach(() => {
        chargeVersion = {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2024-05-31'),
          licence: { startDate: new Date('2017-01-01') }
        }
      })

      it('returns the billing period start and end dates', () => {
        const result = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

        expect(result.startDate).to.equal(billingPeriod.startDate)
        expect(result.endDate).to.equal(billingPeriod.endDate)
      })
    })

    describe("and the licence start date is after the charge version's and inside the billing period", () => {
      beforeEach(() => {
        chargeVersion = {
          startDate: new Date('2023-03-01'),
          endDate: null,
          licence: { startDate: new Date('2023-05-01') }
        }
      })

      it('returns the licence start and billing period end dates', () => {
        const result = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

        expect(result.startDate).to.equal(chargeVersion.licence.startDate)
        expect(result.endDate).to.equal(billingPeriod.endDate)
      })
    })

    describe('and the licence revoked date', () => {
      describe('is inside the billing period', () => {
        beforeEach(() => {
          chargeVersion = {
            startDate: new Date('2022-04-01'),
            endDate: null,
            licence: { startDate: new Date('2023-01-01'), revokedDate: new Date('2023-08-01') }
          }
        })

        it('returns the billing period start and licence revoked end date', () => {
          const result = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

          expect(result.startDate).to.equal(billingPeriod.startDate)
          expect(result.endDate).to.equal(chargeVersion.licence.revokedDate)
        })
      })

      describe('is before the billing period', () => {
        beforeEach(() => {
          chargeVersion = {
            startDate: new Date('2022-04-01'),
            endDate: null,
            licence: { startDate: new Date('2023-01-01'), revokedDate: new Date('2023-02-01') }
          }
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
          chargeVersion = {
            startDate: new Date('2022-04-01'),
            endDate: null,
            licence: { startDate: new Date('2023-01-01'), lapsedDate: new Date('2023-08-01') }
          }
        })

        it('returns the billing period start and licence lapsed end date', () => {
          const result = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

          expect(result.startDate).to.equal(billingPeriod.startDate)
          expect(result.endDate).to.equal(chargeVersion.licence.lapsedDate)
        })
      })

      describe('is before the billing period', () => {
        beforeEach(() => {
          chargeVersion = {
            startDate: new Date('2022-04-01'),
            endDate: null,
            licence: { startDate: new Date('2023-01-01'), lapsedDate: new Date('2023-02-01') }
          }
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
          chargeVersion = {
            startDate: new Date('2022-04-01'),
            endDate: null,
            licence: { startDate: new Date('2023-01-01'), expiredDate: new Date('2023-08-01') }
          }
        })

        it('returns the billing period start and licence expired end date', () => {
          const result = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

          expect(result.startDate).to.equal(billingPeriod.startDate)
          expect(result.endDate).to.equal(chargeVersion.licence.expiredDate)
        })
      })

      describe('is before the billing period', () => {
        beforeEach(() => {
          chargeVersion = {
            startDate: new Date('2022-04-01'),
            endDate: null,
            licence: { startDate: new Date('2023-01-01'), lapsedDate: new Date('2023-02-01') }
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

  describe('the charge version starts inside the billing period', () => {
    describe('and has an end date', () => {
      describe('that is inside the billing period', () => {
        beforeEach(() => {
          chargeVersion = {
            startDate: new Date('2023-05-01'),
            endDate: new Date('2023-05-31'),
            licence: { startDate: new Date('2023-01-01') }
          }
        })

        it('returns the charge version start and end dates', () => {
          const result = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

          expect(result.startDate).to.equal(chargeVersion.startDate)
          expect(result.endDate).to.equal(chargeVersion.endDate)
        })
      })

      describe('that is after the billing period', () => {
        beforeEach(() => {
          chargeVersion = {
            startDate: new Date('2023-05-01'),
            endDate: new Date('2024-05-31'),
            licence: { startDate: new Date('2023-01-01') }
          }
        })

        it('returns the charge version start and billing period end dates', () => {
          const result = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

          expect(result.startDate).to.equal(chargeVersion.startDate)
          expect(result.endDate).to.equal(billingPeriod.endDate)
        })
      })
    })

    describe('and does not have an end date', () => {
      beforeEach(() => {
        chargeVersion = {
          startDate: new Date('2023-05-01'),
          endDate: null,
          licence: { startDate: new Date('2023-01-01') }
        }
      })

      it('returns the charge version start and billing period end dates', () => {
        const result = DetermineChargePeriodService.go(chargeVersion, billingPeriod)

        expect(result.startDate).to.equal(chargeVersion.startDate)
        expect(result.endDate).to.equal(billingPeriod.endDate)
      })
    })

    describe('and the licence expired date', () => {
      describe("is inside the billing period before the charge version's start date", () => {
        beforeEach(() => {
          chargeVersion = {
            startDate: new Date('2023-10-01'),
            endDate: null,
            licence: { startDate: new Date('2023-01-01'), expiredDate: new Date('2023-06-01') }
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

  describe('the charge version starts after the billing period', () => {
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
})
