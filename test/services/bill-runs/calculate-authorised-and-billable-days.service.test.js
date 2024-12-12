'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ChargeReferenceHelper = require('../../support/helpers/charge-reference.helper.js')
const ChargeElementHelper = require('../../support/helpers/charge-element.helper.js')

// Thing under test
const CalculateAuthorisedAndBillableDaysService = require('../../../app/services/bill-runs/calculate-authorised-and-billable-days.service.js')

// NOTE: You might find it helpful to refresh your understanding of abstraction periods and what the service is trying
// to fathom when referencing them to the billing and charge periods. See the documentation in the service. Also, a
// a reminder of what in-year and out-year means.
//
// - In-year: If the abstraction period end month is _after_ the start month, for example 01-Jan to 31-May, then we
//            assign the reference period's end year to both the abstraction start and end dates.
// - Out-year: If the abstraction period end month is _before_ the start month, for example 01-Nov to 31-Mar, then we
//             assign the reference period's end year to the end date, and start year to the start date.

describe('Calculate Authorised and Billable days service', () => {
  const billingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }
  let chargePeriod
  let chargeReference

  beforeEach(async () => {
    chargeReference = await ChargeReferenceHelper.add()
  })

  describe('when there is a single abstraction period (charge element)', () => {
    describe('and the abstraction period is 01-JAN to 31-DEC (in-year)', () => {
      beforeEach(async () => {
        const chargeElement = await ChargeElementHelper.add({
          chargeElementId: chargeReference.chargeElementId,
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 1,
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 12
        })

        chargeReference.chargeElements = [chargeElement]
      })

      describe('and the charge period is 01-NOV-2022 to 31-DEC-2022 (starts and ends first year)', () => {
        beforeEach(() => {
          chargePeriod = {
            startDate: new Date('2022-11-01'),
            endDate: new Date('2022-12-31')
          }
        })

        it('returns 365 for authorised days and 61 for billable days', () => {
          const result = CalculateAuthorisedAndBillableDaysService.go(chargePeriod, billingPeriod, chargeReference)

          expect(result.authorisedDays).to.equal(365)
          expect(result.billableDays).to.equal(61)
        })
      })

      describe('and the charge period is 01-DEC-2022 to 31-JAN-2023 (starts first year, ends second year)', () => {
        beforeEach(() => {
          chargePeriod = {
            startDate: new Date('2022-12-01'),
            endDate: new Date('2023-01-31')
          }
        })

        it('returns 365 for authorised days and 62 for billable days', () => {
          const result = CalculateAuthorisedAndBillableDaysService.go(chargePeriod, billingPeriod, chargeReference)

          expect(result.authorisedDays).to.equal(365)
          expect(result.billableDays).to.equal(62)
        })
      })

      describe('and the charge period is 01-JAN-2023 to 28-FEB-2023 (starts and ends second year)', () => {
        beforeEach(() => {
          chargePeriod = {
            startDate: new Date('2023-01-01'),
            endDate: new Date('2023-02-28')
          }
        })

        it('returns 365 for authorised days 59 for billable days', () => {
          const result = CalculateAuthorisedAndBillableDaysService.go(chargePeriod, billingPeriod, chargeReference)

          expect(result.authorisedDays).to.equal(365)
          expect(result.billableDays).to.equal(59)
        })
      })
    })

    describe('and the abstraction period is 01-JAN to 30-JUN (in-year)', () => {
      beforeEach(async () => {
        const chargeElement = await ChargeElementHelper.add({
          chargeElementId: chargeReference.chargeElementId,
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 1,
          abstractionPeriodEndDay: 30,
          abstractionPeriodEndMonth: 6
        })

        chargeReference.chargeElements = [chargeElement]
      })

      describe('and the charge period is 01-NOV-2022 to 31-DEC-2022 (starts and ends first year)', () => {
        beforeEach(() => {
          chargePeriod = {
            startDate: new Date('2022-11-01'),
            endDate: new Date('2022-12-31')
          }
        })

        it('returns 181 for authorised days and 0 for billable days', () => {
          const result = CalculateAuthorisedAndBillableDaysService.go(chargePeriod, billingPeriod, chargeReference)

          expect(result.authorisedDays).to.equal(181)
          expect(result.billableDays).to.equal(0)
        })
      })

      describe('and the charge period is 01-DEC-2022 to 31-JAN-2023 (starts first year, ends second year)', () => {
        beforeEach(() => {
          chargePeriod = {
            startDate: new Date('2022-12-01'),
            endDate: new Date('2023-01-31')
          }
        })

        it('returns 181 for authorised days and 31 for billable days', () => {
          const result = CalculateAuthorisedAndBillableDaysService.go(chargePeriod, billingPeriod, chargeReference)

          expect(result.authorisedDays).to.equal(181)
          expect(result.billableDays).to.equal(31)
        })
      })

      describe('and the charge period is 01-JAN-2023 to 28-FEB-2023 (starts and ends second year)', () => {
        beforeEach(() => {
          chargePeriod = {
            startDate: new Date('2023-01-01'),
            endDate: new Date('2023-02-28')
          }
        })

        it('returns 181 for authorised days and 59 for billable days', () => {
          const result = CalculateAuthorisedAndBillableDaysService.go(chargePeriod, billingPeriod, chargeReference)

          expect(result.authorisedDays).to.equal(181)
          expect(result.billableDays).to.equal(59)
        })
      })
    })

    describe('and the abstraction period is 01-OCT to 31-MAR (out-year)', () => {
      beforeEach(async () => {
        const chargeElement = await ChargeElementHelper.add({
          chargeElementId: chargeReference.chargeElementId,
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 10,
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 3
        })

        chargeReference.chargeElements = [chargeElement]
      })

      describe('and the charge period is 01-NOV-2022 to 31-DEC-2022 (starts and ends first year)', () => {
        beforeEach(() => {
          chargePeriod = {
            startDate: new Date('2022-11-01'),
            endDate: new Date('2022-12-31')
          }
        })

        it('returns 182 for authorised days and 61 for billable days', () => {
          const result = CalculateAuthorisedAndBillableDaysService.go(chargePeriod, billingPeriod, chargeReference)

          expect(result.authorisedDays).to.equal(182)
          expect(result.billableDays).to.equal(61)
        })
      })

      describe('and the charge period is 01-DEC-2022 to 31-JAN-2023 (starts first year, ends second year)', () => {
        beforeEach(() => {
          chargePeriod = {
            startDate: new Date('2022-12-01'),
            endDate: new Date('2023-01-31')
          }
        })

        it('returns 182 for authorised days and 62 for billable days', () => {
          const result = CalculateAuthorisedAndBillableDaysService.go(chargePeriod, billingPeriod, chargeReference)

          expect(result.authorisedDays).to.equal(182)
          expect(result.billableDays).to.equal(62)
        })
      })

      describe('and the charge period is 01-JAN-2023 to 28-FEB-2023 (starts and ends second year)', () => {
        beforeEach(() => {
          chargePeriod = {
            startDate: new Date('2023-01-01'),
            endDate: new Date('2023-02-28')
          }
        })

        it('returns 182 for authorised days and 59 for billable days', () => {
          const result = CalculateAuthorisedAndBillableDaysService.go(chargePeriod, billingPeriod, chargeReference)

          expect(result.authorisedDays).to.equal(182)
          expect(result.billableDays).to.equal(59)
        })
      })

      describe('and the charge period is 01-AUG-2023 to 30-SEP-2023', () => {
        beforeEach(() => {
          chargePeriod = {
            startDate: new Date('2023-08-01'),
            endDate: new Date('2023-09-30')
          }
        })

        it('returns 182 for authorised days and 0 for billable days', () => {
          const result = CalculateAuthorisedAndBillableDaysService.go(chargePeriod, billingPeriod, chargeReference)

          expect(result.authorisedDays).to.equal(182)
          expect(result.billableDays).to.equal(0)
        })
      })
    })
  })

  describe('where there are multiple abstraction periods (charge elements)', () => {
    describe('and the abstraction periods are 01-OCT to 30-NOV and 01-FEB to 31-MAR', () => {
      beforeEach(async () => {
        const firstChargeElement = await ChargeElementHelper.add({
          chargeElementId: chargeReference.chargeElementId,
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 10,
          abstractionPeriodEndDay: 30,
          abstractionPeriodEndMonth: 11
        })
        const secondChargeElement = await ChargeElementHelper.add({
          chargeElementId: chargeReference.chargeElementId,
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 2,
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 3
        })

        chargeReference.chargeElements = [firstChargeElement, secondChargeElement]
      })

      describe('and the charge period is 01-NOV-2022 to 31-DEC-2022 (starts and ends first year)', () => {
        beforeEach(() => {
          chargePeriod = {
            startDate: new Date('2022-11-01'),
            endDate: new Date('2022-12-31')
          }
        })

        it('returns 120 for authorised days and 30 for billable days', () => {
          const result = CalculateAuthorisedAndBillableDaysService.go(chargePeriod, billingPeriod, chargeReference)

          expect(result.authorisedDays).to.equal(120)
          expect(result.billableDays).to.equal(30)
        })
      })

      describe('and the charge period is 01-DEC-2022 to 31-JAN-2023 (starts first year, ends second year)', () => {
        beforeEach(() => {
          chargePeriod = {
            startDate: new Date('2022-12-01'),
            endDate: new Date('2023-01-31')
          }
        })

        it('returns 120 for authorised days and 0 for billable days', () => {
          const result = CalculateAuthorisedAndBillableDaysService.go(chargePeriod, billingPeriod, chargeReference)

          expect(result.authorisedDays).to.equal(120)
          expect(result.billableDays).to.equal(0)
        })
      })

      describe('and the charge period is 01-JAN-2023 to 28-FEB-2023 (starts and ends second year)', () => {
        beforeEach(() => {
          chargePeriod = {
            startDate: new Date('2023-01-01'),
            endDate: new Date('2023-02-28')
          }
        })

        it('returns 120 for authorised days and 28 for billable days', () => {
          const result = CalculateAuthorisedAndBillableDaysService.go(chargePeriod, billingPeriod, chargeReference)

          expect(result.authorisedDays).to.equal(120)
          expect(result.billableDays).to.equal(28)
        })
      })
    })

    describe('and the charge period is 01-APR-2022 to 31-MAR-2023', () => {
      const chargePeriod = {
        startDate: new Date('2022-04-01'),
        endDate: new Date('2023-03-31')
      }

      describe('and the abstraction periods overlap (01-OCT to 28-FEB and 01-SEP to 31-NOV)', () => {
        beforeEach(async () => {
          const firstChargeElement = await ChargeElementHelper.add({
            chargeElementId: chargeReference.chargeElementId,
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 10,
            abstractionPeriodEndDay: 28,
            abstractionPeriodEndMonth: 2
          })
          const secondChargeElement = await ChargeElementHelper.add({
            chargeElementId: chargeReference.chargeElementId,
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 9,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 11
          })

          chargeReference.chargeElements = [firstChargeElement, secondChargeElement]
        })

        it('returns 181 for authorised days and 181 for billable days', () => {
          const result = CalculateAuthorisedAndBillableDaysService.go(chargePeriod, billingPeriod, chargeReference)

          expect(result.authorisedDays).to.equal(181)
          expect(result.billableDays).to.equal(181)
        })
      })

      describe('and the abstraction periods overlap (01-OCT to 28-FEB and 01-NOV to 31-JAN)', () => {
        beforeEach(async () => {
          const firstChargeElement = await ChargeElementHelper.add({
            chargeElementId: chargeReference.chargeElementId,
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 10,
            abstractionPeriodEndDay: 28,
            abstractionPeriodEndMonth: 2
          })
          const secondChargeElement = await ChargeElementHelper.add({
            chargeElementId: chargeReference.chargeElementId,
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 11,
            abstractionPeriodEndDay: 1,
            abstractionPeriodEndMonth: 1
          })

          chargeReference.chargeElements = [firstChargeElement, secondChargeElement]
        })

        it('returns 151 for authorised days and 151 for billable days', () => {
          const result = CalculateAuthorisedAndBillableDaysService.go(chargePeriod, billingPeriod, chargeReference)

          expect(result.authorisedDays).to.equal(151)
          expect(result.billableDays).to.equal(151)
        })
      })

      describe('and the abstraction periods overlap (01-OCT to 28-FEB and 01-JAN to 31-MAR)', () => {
        beforeEach(async () => {
          const firstChargeElement = await ChargeElementHelper.add({
            chargeElementId: chargeReference.chargeElementId,
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 10,
            abstractionPeriodEndDay: 28,
            abstractionPeriodEndMonth: 2
          })
          const secondChargeElement = await ChargeElementHelper.add({
            chargeElementId: chargeReference.chargeElementId,
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 1,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 3
          })

          chargeReference.chargeElements = [firstChargeElement, secondChargeElement]
        })

        it('returns 182 for authorised days and 182 for billable days', () => {
          const result = CalculateAuthorisedAndBillableDaysService.go(chargePeriod, billingPeriod, chargeReference)

          expect(result.authorisedDays).to.equal(182)
          expect(result.billableDays).to.equal(182)
        })
      })
    })
  })
})
