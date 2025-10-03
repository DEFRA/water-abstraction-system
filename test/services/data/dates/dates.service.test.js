'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const DatesService = require('../../../../app/services/data/dates/dates.service.js')

// NOTE: The service is calling a series of other services that actually determine the dates we return. So, we are not
// interested in duplicating that testing here. Instead, we focus on confirming the structure is as we expect whilst
// trying to avoid asserting the values (else it will just keep breaking!)
describe('Data - Dates service', () => {
  it('returns the current billing periods', () => {
    const result = DatesService.go()

    expect(result.billingPeriods).to.exist()

    expect(result.billingPeriods.annual).to.exist()
    expect(result.billingPeriods.annual).to.have.length(1)
    expect(result.billingPeriods.annual[0].startDate).to.be.instanceOf(Date)
    expect(result.billingPeriods.annual[0].endDate).to.be.instanceOf(Date)

    expect(result.billingPeriods.supplementary).to.exist()
    expect(result.billingPeriods.supplementary.length).to.be.between(1, 6)
    expect(result.billingPeriods.supplementary[0].startDate).to.be.instanceOf(Date)
    expect(result.billingPeriods.supplementary[0].endDate).to.be.instanceOf(Date)

    expect(result.billingPeriods.twoPartTariff).to.exist()
    expect(result.billingPeriods.twoPartTariff).to.have.length(1)
    expect(result.billingPeriods.twoPartTariff[0].startDate).to.be.instanceOf(Date)
    expect(result.billingPeriods.twoPartTariff[0].endDate).to.be.instanceOf(Date)

    expect(result.billingPeriods.twoPartSupplementary).to.exist()
    expect(result.billingPeriods.twoPartSupplementary).to.have.length(1)
    expect(result.billingPeriods.twoPartSupplementary[0].startDate).to.be.instanceOf(Date)
    expect(result.billingPeriods.twoPartSupplementary[0].endDate).to.be.instanceOf(Date)
  })

  it('returns the current financial year', () => {
    const result = DatesService.go()

    expect(result.currentFinancialYear).to.exist()
    expect(result.currentFinancialYear.startDate).to.be.instanceOf(Date)
    expect(result.currentFinancialYear.endDate).to.be.instanceOf(Date)
  })

  it('returns the current summer return cycle', () => {
    const result = DatesService.go()

    expect(result.currentSummerReturnCycle).to.exist()
    expect(result.currentSummerReturnCycle.startDate).to.be.instanceOf(Date)
    expect(result.currentSummerReturnCycle.endDate).to.be.instanceOf(Date)
  })

  it('returns the current winter return cycle', () => {
    const result = DatesService.go()

    expect(result.currentWinterReturnCycle).to.exist()
    expect(result.currentWinterReturnCycle.startDate).to.be.instanceOf(Date)
    expect(result.currentWinterReturnCycle.endDate).to.be.instanceOf(Date)
  })

  it('returns the current returns periods', () => {
    const result = DatesService.go()

    expect(result.firstReturnPeriod).to.exist()
    expect(result.firstReturnPeriod.name).to.exist()
    expect(result.firstReturnPeriod.startDate).to.be.instanceOf(Date)
    expect(result.firstReturnPeriod.endDate).to.be.instanceOf(Date)
    expect(result.firstReturnPeriod.dueDate).to.be.instanceOf(Date)

    expect(result.secondReturnPeriod).to.exist()
    expect(result.secondReturnPeriod.name).to.exist()
    expect(result.secondReturnPeriod.startDate).to.be.instanceOf(Date)
    expect(result.secondReturnPeriod.endDate).to.be.instanceOf(Date)
    expect(result.secondReturnPeriod.dueDate).to.be.instanceOf(Date)
  })
})
