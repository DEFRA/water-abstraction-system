'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnLogHelper = require('../../support/helpers/return-log.helper.js')
const RegionHelper = require('../../support/helpers/region.helper.js')

// Things we need to stub
const databaseConfig = require('../../../config/database.config.js')

// Thing under test
const FetchReturnLogSearchResultsService = require('../../../app/services/search/fetch-return-log-search-results.service.js')

describe('Search - Fetch return log search results service', () => {
  const region1 = RegionHelper.select(1)
  const region2 = RegionHelper.select(2)
  const returnLogs = []

  before(async () => {
    let returnLog

    // Add the return logs in non-alphabetical order to prove the ordering in the results
    // They should come back in the order [2, 3, 0, 1]

    returnLog = await ReturnLogHelper.add({
      returnReference: '8801100010',
      endDate: new Date('2020-01-01'),
      metadata: { nald: { regionCode: region1.naldRegionId.toString() } }
    })
    returnLogs.push({ returnLog, region: region1 })

    returnLog = await ReturnLogHelper.add({
      returnReference: '8801100010',
      endDate: new Date('2020-01-01'),
      metadata: { nald: { regionCode: region2.naldRegionId.toString() } }
    })
    returnLogs.push({ returnLog, region: region2 })

    returnLog = await ReturnLogHelper.add({
      returnReference: '6601100010',
      endDate: new Date('2020-01-01'),
      metadata: { nald: { regionCode: region1.naldRegionId.toString() } }
    })
    returnLogs.push({ returnLog, region: region1 })

    returnLog = await ReturnLogHelper.add({
      returnReference: '8801100010',
      endDate: new Date('2020-01-02'),
      metadata: { nald: { regionCode: region1.naldRegionId.toString() } }
    })
    returnLogs.push({ returnLog, region: region1 })
  })

  describe('when matching return logs exist', () => {
    it('returns the correctly ordered matching return logs', async () => {
      const result = await FetchReturnLogSearchResultsService.go('01100010', 1)

      expect(result).to.equal({
        results: [
          {
            endDate: returnLogs[2].returnLog.endDate,
            id: returnLogs[2].returnLog.id,
            licenceRef: returnLogs[2].returnLog.licenceRef,
            naldRegionId: returnLogs[2].region.naldRegionId,
            regionDisplayName: returnLogs[2].region.displayName,
            returnReference: returnLogs[2].returnLog.returnReference,
            status: returnLogs[2].returnLog.status
          },
          {
            endDate: returnLogs[3].returnLog.endDate,
            id: returnLogs[3].returnLog.id,
            licenceRef: returnLogs[3].returnLog.licenceRef,
            naldRegionId: returnLogs[3].region.naldRegionId,
            regionDisplayName: returnLogs[3].region.displayName,
            returnReference: returnLogs[3].returnLog.returnReference,
            status: returnLogs[3].returnLog.status
          },
          {
            endDate: returnLogs[0].returnLog.endDate,
            id: returnLogs[0].returnLog.id,
            licenceRef: returnLogs[0].returnLog.licenceRef,
            naldRegionId: returnLogs[0].region.naldRegionId,
            regionDisplayName: returnLogs[0].region.displayName,
            returnReference: returnLogs[0].returnLog.returnReference,
            status: returnLogs[0].returnLog.status
          },
          {
            endDate: returnLogs[1].returnLog.endDate,
            id: returnLogs[1].returnLog.id,
            licenceRef: returnLogs[1].returnLog.licenceRef,
            naldRegionId: returnLogs[1].region.naldRegionId,
            regionDisplayName: returnLogs[1].region.displayName,
            returnReference: returnLogs[1].returnLog.returnReference,
            status: returnLogs[1].returnLog.status
          }
        ],
        total: 4
      })
    })
  })

  describe('when only one matching return log exists', () => {
    it('returns the correct return log', async () => {
      const result = await FetchReturnLogSearchResultsService.go('6601100010', 1)

      expect(result).to.equal({
        results: [
          {
            endDate: returnLogs[2].returnLog.endDate,
            id: returnLogs[2].returnLog.id,
            licenceRef: returnLogs[2].returnLog.licenceRef,
            naldRegionId: returnLogs[2].region.naldRegionId,
            regionDisplayName: returnLogs[2].region.displayName,
            returnReference: returnLogs[2].returnLog.returnReference,
            status: returnLogs[2].returnLog.status
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
      const result = await FetchReturnLogSearchResultsService.go('01100010', 2)

      expect(result).to.equal({
        results: [
          {
            endDate: returnLogs[3].returnLog.endDate,
            id: returnLogs[3].returnLog.id,
            licenceRef: returnLogs[3].returnLog.licenceRef,
            naldRegionId: returnLogs[3].region.naldRegionId,
            regionDisplayName: returnLogs[3].region.displayName,
            returnReference: returnLogs[3].returnLog.returnReference,
            status: returnLogs[3].returnLog.status
          }
        ],
        total: 4
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
})
