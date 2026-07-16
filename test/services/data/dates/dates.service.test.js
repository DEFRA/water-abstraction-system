// Test framework
import { describe, expect, it } from 'vitest'

// Thing under test
import DatesService from '../../../../app/services/data/dates/dates.service.js'

// NOTE: The service is calling a series of other services that actually determine the dates we return. So, we are not
// interested in duplicating that testing here. Instead, we focus on confirming the structure is as we expect whilst
// trying to avoid asserting the values (else it will just keep breaking!)
describe('Data - Dates service', () => {
  it('returns the current billing periods', () => {
    const result = DatesService()

    expect(result.billingPeriods).toBeDefined()

    expect(result.billingPeriods.annual).toBeDefined()
    expect(result.billingPeriods.annual).toHaveLength(1)
    expect(result.billingPeriods.annual[0].startDate).toBeInstanceOf(Date)
    expect(result.billingPeriods.annual[0].endDate).toBeInstanceOf(Date)

    expect(result.billingPeriods.supplementary).toBeDefined()
    expect(result.billingPeriods.supplementary.length).toBeGreaterThanOrEqual(1)
    expect(result.billingPeriods.supplementary.length).toBeLessThanOrEqual(6)
    expect(result.billingPeriods.supplementary[0].startDate).toBeInstanceOf(Date)
    expect(result.billingPeriods.supplementary[0].endDate).toBeInstanceOf(Date)

    expect(result.billingPeriods.twoPartTariff).toBeDefined()
    expect(result.billingPeriods.twoPartTariff).toHaveLength(1)
    expect(result.billingPeriods.twoPartTariff[0].startDate).toBeInstanceOf(Date)
    expect(result.billingPeriods.twoPartTariff[0].endDate).toBeInstanceOf(Date)

    expect(result.billingPeriods.twoPartSupplementary).toBeDefined()
    expect(result.billingPeriods.twoPartSupplementary).toHaveLength(1)
    expect(result.billingPeriods.twoPartSupplementary[0].startDate).toBeInstanceOf(Date)
    expect(result.billingPeriods.twoPartSupplementary[0].endDate).toBeInstanceOf(Date)
  })

  it('returns the current financial year', () => {
    const result = DatesService()

    expect(result.currentFinancialYear).toBeDefined()
    expect(result.currentFinancialYear.startDate).toBeInstanceOf(Date)
    expect(result.currentFinancialYear.endDate).toBeInstanceOf(Date)
  })

  it('returns the current summer return cycle', () => {
    const result = DatesService()

    expect(result.currentSummerReturnCycle).toBeDefined()
    expect(result.currentSummerReturnCycle.startDate).toBeInstanceOf(Date)
    expect(result.currentSummerReturnCycle.endDate).toBeInstanceOf(Date)
  })

  it('returns the current winter return cycle', () => {
    const result = DatesService()

    expect(result.currentWinterReturnCycle).toBeDefined()
    expect(result.currentWinterReturnCycle.startDate).toBeInstanceOf(Date)
    expect(result.currentWinterReturnCycle.endDate).toBeInstanceOf(Date)
  })

  it('returns the current returns periods', () => {
    const result = DatesService()

    expect(result.firstReturnPeriod).toBeDefined()
    expect(result.firstReturnPeriod.name).toBeDefined()
    expect(result.firstReturnPeriod.startDate).toBeInstanceOf(Date)
    expect(result.firstReturnPeriod.endDate).toBeInstanceOf(Date)
    expect(result.firstReturnPeriod.dueDate).toBeInstanceOf(Date)

    expect(result.secondReturnPeriod).toBeDefined()
    expect(result.secondReturnPeriod.name).toBeDefined()
    expect(result.secondReturnPeriod.startDate).toBeInstanceOf(Date)
    expect(result.secondReturnPeriod.endDate).toBeInstanceOf(Date)
    expect(result.secondReturnPeriod.dueDate).toBeInstanceOf(Date)
  })
})
