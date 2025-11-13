'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const ReturnLogHelper = require('../../support/helpers/return-log.helper.js')
const ReturnRequirementHelper = require('../../support/helpers/return-requirement.helper.js')

// Things we need to stub
const databaseConfig = require('../../../config/database.config.js')

// Thing under test
const FetchReturnLogSearchResultsService = require('../../../app/services/search/fetch-return-log-search-results.service.js')

describe('Search - Fetch return log search results service', () => {
  const returnLogs = []

  before(async () => {
    let returnLog

    const licence1 = await LicenceHelper.add({ licenceRef: 'SEARCH-TEST-1' })
    const licence2 = await LicenceHelper.add({ licenceRef: 'SEARCH-TEST-2' })
    const licence3 = await LicenceHelper.add({ licenceRef: 'SEARCH-TEST-3' })

    const returnRequirement1 = await ReturnRequirementHelper.add()
    const returnRequirement2 = await ReturnRequirementHelper.add()
    const returnRequirement3 = await ReturnRequirementHelper.add()

    // Add the return logs in non-linear order to prove the grouping and ordering in the results
    // They should come back grouped and ordered: [2, (0 and 3 grouped), 1]

    returnLog = await ReturnLogHelper.add({
      dueDate: new Date('2021-01-01'),
      endDate: new Date('2020-01-01'),
      returnRequirementId: returnRequirement1.id,
      licenceRef: licence1.licenceRef,
      returnReference: '8801100010'
    })
    returnLogs.push({ returnLog, licence: licence1 })

    returnLog = await ReturnLogHelper.add({
      dueDate: new Date('2021-01-01'),
      endDate: new Date('2020-01-01'),
      returnRequirementId: returnRequirement2.id,
      licenceRef: licence2.licenceRef,
      returnReference: '8801100010'
    })
    returnLogs.push({ returnLog, licence: licence2 })

    returnLog = await ReturnLogHelper.add({
      dueDate: new Date('2021-01-01'),
      endDate: new Date('2020-01-01'),
      licenceRef: licence3.licenceRef,
      returnReference: '6601100010',
      returnRequirementId: returnRequirement3.id
    })
    returnLogs.push({ returnLog, licence: licence3 })

    returnLog = await ReturnLogHelper.add({
      dueDate: new Date('2021-01-01'),
      endDate: new Date('2020-01-02'),
      returnRequirementId: returnRequirement1.id,
      licenceRef: licence1.licenceRef,
      returnReference: '8801100010'
    })
    returnLogs.push({ returnLog, licence: licence1 })
  })

  describe('when matching return logs exist', () => {
    it('returns the correctly ordered matching return logs', async () => {
      const result = await FetchReturnLogSearchResultsService.go('01100010', 1)

      // Ordering within aggregated array values from the database is not guaranteed, so we have to check the contents
      // of the result individually, rather than doing a straight equality check

      expect(result.total).to.equal(3)
      expect(result.results.length).to.equal(3)

      expect(result.results[0]).to.equal({
        dueDates: [returnLogs[2].returnLog.dueDate],
        endDates: [returnLogs[2].returnLog.endDate],
        id: returnLogs[2].licence.id,
        ids: [returnLogs[2].returnLog.id],
        licenceRef: returnLogs[2].licence.licenceRef,
        returnReference: returnLogs[2].returnLog.returnReference,
        returnRequirementId: returnLogs[2].returnLog.returnRequirementId,
        statuses: [returnLogs[2].returnLog.status]
      })

      expect(result.results[1]).to.equal(
        {
          dueDates: [returnLogs[0].returnLog.dueDate, returnLogs[3].returnLog.dueDate],
          endDates: [returnLogs[0].returnLog.endDate, returnLogs[3].returnLog.endDate],
          id: returnLogs[0].licence.id,
          ids: [returnLogs[0].returnLog.id, returnLogs[3].returnLog.id],
          licenceRef: returnLogs[0].licence.licenceRef,
          returnReference: returnLogs[0].returnLog.returnReference,
          returnRequirementId: returnLogs[0].returnLog.returnRequirementId,
          statuses: [returnLogs[0].returnLog.status, returnLogs[3].returnLog.status]
        },
        { skip: ['dueDates', 'endDates', 'ids', 'statuses'] }
      )
      expect(result.results[1].dueDates).to.contain([returnLogs[0].returnLog.dueDate])
      expect(result.results[1].endDates).to.contain([returnLogs[0].returnLog.endDate])
      expect(result.results[1].ids).to.contain([returnLogs[0].returnLog.id])
      expect(result.results[1].statuses).to.contain([returnLogs[0].returnLog.status])
      expect(result.results[1].dueDates).to.contain([returnLogs[3].returnLog.dueDate])
      expect(result.results[1].endDates).to.contain([returnLogs[3].returnLog.endDate])
      expect(result.results[1].ids).to.contain([returnLogs[3].returnLog.id])
      expect(result.results[1].statuses).to.contain([returnLogs[3].returnLog.status])

      expect(result.results[2]).to.equal({
        dueDates: [returnLogs[1].returnLog.dueDate],
        endDates: [returnLogs[1].returnLog.endDate],
        id: returnLogs[1].licence.id,
        ids: [returnLogs[1].returnLog.id],
        licenceRef: returnLogs[1].returnLog.licenceRef,
        returnReference: returnLogs[1].returnLog.returnReference,
        returnRequirementId: returnLogs[1].returnLog.returnRequirementId,
        statuses: [returnLogs[1].returnLog.status]
      })
    })
  })

  describe('when only one matching return log exists', () => {
    it('returns the correct return log', async () => {
      const result = await FetchReturnLogSearchResultsService.go('601100010', 1)

      expect(result).to.equal({
        results: [
          {
            dueDates: [returnLogs[2].returnLog.dueDate],
            endDates: [returnLogs[2].returnLog.endDate],
            id: returnLogs[2].licence.id,
            ids: [returnLogs[2].returnLog.id],
            licenceRef: returnLogs[2].licence.licenceRef,
            returnReference: returnLogs[2].returnLog.returnReference,
            returnRequirementId: returnLogs[2].returnLog.returnRequirementId,
            statuses: [returnLogs[2].returnLog.status]
          }
        ],
        total: 1
      })
    })
  })

  describe('when multiple pages of results exist', () => {
    beforeEach(() => {
      // Set the page size to 1 to force multiple pages of results
      Sinon.stub(databaseConfig, 'defaultPageSize').value(1)
    })

    afterEach(() => {
      Sinon.restore()
    })

    it('correctly returns the requested page of results', async () => {
      const result = await FetchReturnLogSearchResultsService.go('01100010', 3)

      expect(result).to.equal({
        results: [
          {
            dueDates: [returnLogs[1].returnLog.dueDate],
            endDates: [returnLogs[1].returnLog.endDate],
            id: returnLogs[1].licence.id,
            ids: [returnLogs[1].returnLog.id],
            licenceRef: returnLogs[1].returnLog.licenceRef,
            returnReference: returnLogs[1].returnLog.returnReference,
            returnRequirementId: returnLogs[1].returnLog.returnRequirementId,
            statuses: [returnLogs[1].returnLog.status]
          }
        ],
        total: 3
      })
    })
  })

  describe('when no matching return logs exist', () => {
    it('returns empty query results', async () => {
      const result = await FetchReturnLogSearchResultsService.go('NON-NUMERIC', 1)

      expect(result).to.equal({
        results: [],
        total: 0
      })
    })
  })

  describe('when searching for an exact match', () => {
    it('returns the correct return log', async () => {
      const result = await FetchReturnLogSearchResultsService.go('6601100010', 1, true)

      expect(result).to.equal({
        results: [
          {
            dueDates: [returnLogs[2].returnLog.dueDate],
            endDates: [returnLogs[2].returnLog.endDate],
            id: returnLogs[2].licence.id,
            ids: [returnLogs[2].returnLog.id],
            licenceRef: returnLogs[2].licence.licenceRef,
            returnReference: returnLogs[2].returnLog.returnReference,
            returnRequirementId: returnLogs[2].returnLog.returnRequirementId,
            statuses: [returnLogs[2].returnLog.status]
          }
        ],
        total: 1
      })
    })
  })
})
