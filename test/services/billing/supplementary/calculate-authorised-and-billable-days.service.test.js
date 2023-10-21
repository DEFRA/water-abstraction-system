'use strict'

const CalculateAuthorisedAndBillableDaysService = require('../../../../app/services/billing/supplementary/calculate-authorised-and-billable-days.service.js')
const ChargeReferenceHelper = require('../../../support/helpers/water/charge-reference.helper.js')
const ChargeElementHelper = require('../../../support/helpers/water/charge-element.helper.js')
const DatabaseHelper = require('../../../support/helpers/database.helper.js')

describe('Calculate Authorised and Billable days service', () => {
  const billingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }
  let chargePeriod
  let chargeReference

  beforeEach(async () => {
    await DatabaseHelper.clean()

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

          expect(result.authorisedDays).toEqual(365)
          expect(result.billableDays).toEqual(61)
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

          expect(result.authorisedDays).toEqual(365)
          expect(result.billableDays).toEqual(62)
        })
      })

      describe('and the charge period is 01-JAN-2023 to 28-FEB-2023 (starts and ends second year)', () => {
        beforeEach(() => {
          chargePeriod = {
            startDate: new Date('2023-01-01'),
            endDate: new Date('2023-02-28')
          }
        })

        it('returns 365 for authorised days and 59 for billable days', () => {
          const result = CalculateAuthorisedAndBillableDaysService.go(chargePeriod, billingPeriod, chargeReference)

          expect(result.authorisedDays).toEqual(365)
          expect(result.billableDays).toEqual(59)
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

          expect(result.authorisedDays).toEqual(181)
          expect(result.billableDays).toEqual(0)
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

          expect(result.authorisedDays).toEqual(181)
          expect(result.billableDays).toEqual(31)
        })
      })
    })
  })
})
