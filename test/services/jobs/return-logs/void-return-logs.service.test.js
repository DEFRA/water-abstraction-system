'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { formatDateObjectToISO } = require('../../../../app/lib/dates.lib.js')
const ReturnCycleHelper = require('../../../support/helpers/return-cycle.helper.js')
const ReturnLogModel = require('../../../../app/models/return-log.model.js')
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')

// Thing under test
const VoidReturnLogsService = require('../../../../app/services/jobs/return-logs/void-return-logs.service.js')

describe('Void return log service', () => {
  let licenceReference
  let otherReference
  let previousCycle
  let previousSummerCycle
  let returnCycle
  let summer
  let summerCycle
  let testDate

  describe('when licence only has summer returns and an end date that ends in the current summer cycle', () => {
    before(async () => {
      summer = true
      licenceReference = 'summerEndDateInThisCycle'

      returnCycle = await ReturnCycleHelper.select(0, summer)
      previousCycle = await ReturnCycleHelper.select(1, summer)

      const returnCycleEndDate = new Date(returnCycle.endDate)

      testDate = new Date(`${returnCycleEndDate.getFullYear()}-${returnCycleEndDate.getMonth()}-25`)

      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(returnCycle.endDate),
        licenceRef: licenceReference,
        returnCycleId: returnCycle.id,
        startDate: formatDateObjectToISO(returnCycle.startDate)
      })
      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(previousCycle.endDate),
        licenceRef: licenceReference,
        returnCycleId: previousCycle.id,
        startDate: formatDateObjectToISO(previousCycle.startDate)
      })
    })

    it('should change the status to void of the current summer return logs', async () => {
      await VoidReturnLogsService.go(licenceReference, testDate)
      const result = await ReturnLogModel.query().where('licenceRef', licenceReference).orderBy('endDate', 'ASC')

      expect(result.length).to.equal(2)
      expect(result[0].status).to.equal('due')
      expect(result[1].status).to.equal('void')
    })
  })

  describe('when licence only has all year returns and an end date that ends in the current all year cycle', () => {
    before(async () => {
      summer = false
      licenceReference = 'allYearEndDateInThisCycle'

      returnCycle = await ReturnCycleHelper.select(0, summer)
      previousCycle = await ReturnCycleHelper.select(1, summer)

      const returnCycleEndDate = new Date(returnCycle.endDate)

      testDate = new Date(`${returnCycleEndDate.getFullYear()}-${returnCycleEndDate.getMonth()}-25`)

      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(returnCycle.endDate),
        licenceRef: licenceReference,
        returnCycleId: returnCycle.id,
        startDate: formatDateObjectToISO(returnCycle.startDate)
      })
      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(previousCycle.endDate),
        licenceRef: licenceReference,
        returnCycleId: previousCycle.id,
        startDate: formatDateObjectToISO(previousCycle.startDate)
      })
    })

    it('should change the status to void of the current all year return logs', async () => {
      await VoidReturnLogsService.go(licenceReference, testDate)
      const result = await ReturnLogModel.query().where('licenceRef', licenceReference).orderBy('endDate', 'ASC')

      expect(result.length).to.equal(2)
      expect(result[0].status).to.equal('due')
      expect(result[1].status).to.equal('void')
    })
  })

  describe('when licence has summer and all year returns and an end date that ends in the current all year cycle', () => {
    before(async () => {
      summer = false
      licenceReference = 'bothCyclesEndDateInThisCycle'
      otherReference = 'otherLicenceReference'

      returnCycle = await ReturnCycleHelper.select(0, summer)
      previousCycle = await ReturnCycleHelper.select(1, summer)
      summerCycle = await ReturnCycleHelper.select(0, !summer)
      previousSummerCycle = await ReturnCycleHelper.select(1, !summer)

      const returnCycleEndDate = new Date(returnCycle.endDate)

      testDate = new Date(`${returnCycleEndDate.getFullYear()}-${returnCycleEndDate.getMonth()}-25`)

      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(returnCycle.endDate),
        licenceRef: licenceReference,
        returnCycleId: returnCycle.id,
        startDate: formatDateObjectToISO(returnCycle.startDate)
      })
      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(returnCycle.endDate),
        licenceRef: otherReference,
        returnCycleId: returnCycle.id,
        startDate: formatDateObjectToISO(returnCycle.startDate)
      })
      await ReturnLogHelper.add({
        endDate: formatDateObjectToISO(previousCycle.endDate),
        licenceRef: licenceReference,
        returnCycleId: previousCycle.id,
        startDate: formatDateObjectToISO(previousCycle.startDate)
      })
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
    })

    it('should change the status to void of the current summer and all year return logs', async () => {
      await VoidReturnLogsService.go(licenceReference, testDate)
      const result = await ReturnLogModel.query().where('licenceRef', licenceReference).orderBy('endDate', 'ASC')
      const otherResult = await ReturnLogModel.query().where('licenceRef', otherReference).orderBy('endDate', 'ASC')

      expect(result.length).to.equal(4)
      expect(result[0].status).to.equal('due')
      expect(result[1].status).to.equal('due')
      expect(result[2].status).to.equal('void')
      expect(result[3].status).to.equal('void')
      expect(otherResult[0].status).to.equal('due')
    })
  })
})
