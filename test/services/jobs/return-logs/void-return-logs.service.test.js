'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { formatDateObjectToISO } = require('../../../../app/lib/dates.lib.js')
const ReturnCycleHelper = require('../../../support/helpers/return-cycle.helper.js')
const ReturnLogModel = require('../../../../app/models/return-log.model.js')
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')

// Thing under test
const VoidReturnLogsService = require('../../../../app/services/jobs/return-logs/void-return-logs.service.js')

describe.only('Void return log service', () => {
  let licenceReference
  let allYearCycle
  let previousAllYearCycle
  let summerCycle
  let previousSummerCycle
  let endDate

  describe('when provided a licence ref and an end date that ends in august of the current summer cycle', () => {
    before(async () => {
      licenceReference = 'endDateInThisCycle'
      allYearCycle = await ReturnCycleHelper.select(1, false)
      previousAllYearCycle = await ReturnCycleHelper.select(2, false)
      summerCycle = await ReturnCycleHelper.select(1, true)
      previousSummerCycle = await ReturnCycleHelper.select(2, true)
      endDate = new Date(summerCycle.endDate)
      endDate.setMonth(7)

      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(summerCycle.endDate),
        licenceRef: licenceReference,
        returnCycleId: summerCycle.id,
        startDate: formatDateObjectToISO(summerCycle.startDate)
      })
      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(previousSummerCycle.endDate),
        licenceRef: licenceReference,
        returnCycleId: previousSummerCycle.id,
        startDate: formatDateObjectToISO(previousSummerCycle.startDate)
      })
      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(allYearCycle.endDate),
        licenceRef: licenceReference,
        returnCycleId: allYearCycle.id,
        startDate: formatDateObjectToISO(allYearCycle.startDate)
      })
      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(previousAllYearCycle.endDate),
        licenceRef: licenceReference,
        returnCycleId: previousAllYearCycle.id,
        startDate: formatDateObjectToISO(previousAllYearCycle.startDate)
      })
    })

    it('should change the status to void of the current all year and summer return logs', async () => {
      await VoidReturnLogsService.go(licenceReference, endDate)
      const result = await ReturnLogModel.query().where('licenceRef', licenceReference)

      expect(result.length).to.equal(4)
      expect(result[0].status).to.equal('due')
      expect(result[1].status).to.equal('due')
      expect(result[2].status).to.equal('void')
      expect(result[3].status).to.equal('void')
    })
  })

  describe('when provided a licence ref and an end date that ends in august of the previous summer cycle', () => {
    before(async () => {
      licenceReference = 'endDateInPreviousCycle'
      allYearCycle = await ReturnCycleHelper.select(1, false)
      previousAllYearCycle = await ReturnCycleHelper.select(2, false)
      summerCycle = await ReturnCycleHelper.select(1, true)
      previousSummerCycle = await ReturnCycleHelper.select(2, true)
      endDate = new Date(summerCycle.endDate)
      endDate.setMonth(7)
      endDate.setFullYear(endDate.getFullYear() - 1)

      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(summerCycle.endDate),
        licenceRef: licenceReference,
        returnCycleId: summerCycle.id,
        startDate: formatDateObjectToISO(summerCycle.startDate)
      })
      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(previousSummerCycle.endDate),
        licenceRef: licenceReference,
        returnCycleId: previousSummerCycle.id,
        startDate: formatDateObjectToISO(previousSummerCycle.startDate)
      })
      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(allYearCycle.endDate),
        licenceRef: licenceReference,
        returnCycleId: allYearCycle.id,
        startDate: formatDateObjectToISO(allYearCycle.startDate)
      })
      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(previousAllYearCycle.endDate),
        licenceRef: licenceReference,
        returnCycleId: previousAllYearCycle.id,
        startDate: formatDateObjectToISO(previousAllYearCycle.startDate)
      })
    })

    it('should change the status to void of the last 4 return logs', async () => {
      await VoidReturnLogsService.go(licenceReference, endDate)
      const result = await ReturnLogModel.query().where('licenceRef', licenceReference)

      expect(result.length).to.equal(4)
      expect(result[0].status).to.equal('void')
      expect(result[1].status).to.equal('void')
      expect(result[2].status).to.equal('void')
      expect(result[3].status).to.equal('void')
    })
  })

  describe('when provided a licence ref and an end date that ends in febuary of the all year cycle', () => {
    before(async () => {
      licenceReference = 'endDateInThisAllYearCycle'
      allYearCycle = await ReturnCycleHelper.select(1, false)
      previousAllYearCycle = await ReturnCycleHelper.select(2, false)
      summerCycle = await ReturnCycleHelper.select(1, true)
      previousSummerCycle = await ReturnCycleHelper.select(2, true)
      endDate = new Date(allYearCycle.endDate)
      endDate.setMonth(0)

      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(summerCycle.endDate),
        licenceRef: licenceReference,
        returnCycleId: summerCycle.id,
        startDate: formatDateObjectToISO(summerCycle.startDate)
      })
      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(previousSummerCycle.endDate),
        licenceRef: licenceReference,
        returnCycleId: previousSummerCycle.id,
        startDate: formatDateObjectToISO(previousSummerCycle.startDate)
      })
      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(allYearCycle.endDate),
        licenceRef: licenceReference,
        returnCycleId: allYearCycle.id,
        startDate: formatDateObjectToISO(allYearCycle.startDate)
      })
      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(previousAllYearCycle.endDate),
        licenceRef: licenceReference,
        returnCycleId: previousAllYearCycle.id,
        startDate: formatDateObjectToISO(previousAllYearCycle.startDate)
      })
    })

    it('should change the status to void of the current all year and summer return logs', async () => {
      await VoidReturnLogsService.go(licenceReference, endDate)
      const result = await ReturnLogModel.query().where('licenceRef', licenceReference)

      expect(result.length).to.equal(4)
      expect(result[0].status).to.equal('due')
      expect(result[1].status).to.equal('due')
      expect(result[2].status).to.equal('due')
      expect(result[3].status).to.equal('void')
    })
  })
})
