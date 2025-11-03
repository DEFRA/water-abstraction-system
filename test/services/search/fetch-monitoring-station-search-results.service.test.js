'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const MonitoringStationHelper = require('../../support/helpers/monitoring-station.helper.js')

// Things we need to stub
const databaseConfig = require('../../../config/database.config.js')

// Thing under test
const FetchMonitoringStationSearchResultsService = require('../../../app/services/search/fetch-monitoring-station-search-results.service.js')

describe.only('Search - Fetch monitoring station search results service', () => {
  const monitoringStations = []

  before(async () => {
    // Add the monitoring stations in non-alphabetical order to prove the ordering in the results
    monitoringStations.push(await MonitoringStationHelper.add({ label: 'Somewhere TESTSEARCH Station 02' }))
    monitoringStations.push(await MonitoringStationHelper.add({ label: 'Somewhere TESTSEARCH Station 03' }))
    monitoringStations.push(await MonitoringStationHelper.add({ label: 'Somewhere TESTSEARCH Station 01' }))
  })

  describe('when matching monitoring stations exist', () => {
    it('returns the correctly ordered matching monitoring stations', async () => {
      const result = await FetchMonitoringStationSearchResultsService.go('TESTSEARCH', 1)

      expect(result).to.equal({
        results: [
          {
            catchmentName: monitoringStations[2].catchmentName,
            gridReference: monitoringStations[2].gridReference,
            id: monitoringStations[2].id,
            label: monitoringStations[2].label,
            riverName: monitoringStations[2].riverName
          },
          {
            catchmentName: monitoringStations[0].catchmentName,
            gridReference: monitoringStations[0].gridReference,
            id: monitoringStations[0].id,
            label: monitoringStations[0].label,
            riverName: monitoringStations[0].riverName
          },
          {
            catchmentName: monitoringStations[1].catchmentName,
            gridReference: monitoringStations[1].gridReference,
            id: monitoringStations[1].id,
            label: monitoringStations[1].label,
            riverName: monitoringStations[1].riverName
          }
        ],
        total: 3
      })
    })
  })

  describe('when searching for an exact match', () => {
    it('returns the correct monitoring station', async () => {
      const result = await FetchMonitoringStationSearchResultsService.go('somewhere testsearch station 01', 1, true)

      expect(result).to.equal({
        results: [
          {
            catchmentName: monitoringStations[2].catchmentName,
            gridReference: monitoringStations[2].gridReference,
            id: monitoringStations[2].id,
            label: monitoringStations[2].label,
            riverName: monitoringStations[2].riverName
          }
        ],
        total: 1
      })
    })
  })

  describe('when the case of the search text does not match that of the station label', () => {
    it('still returns the correct monitoring stations', async () => {
      const result = await FetchMonitoringStationSearchResultsService.go('tEsTsEaRcH', 1)

      expect(result).to.equal({
        results: [
          {
            catchmentName: monitoringStations[2].catchmentName,
            gridReference: monitoringStations[2].gridReference,
            id: monitoringStations[2].id,
            label: monitoringStations[2].label,
            riverName: monitoringStations[2].riverName
          },
          {
            catchmentName: monitoringStations[0].catchmentName,
            gridReference: monitoringStations[0].gridReference,
            id: monitoringStations[0].id,
            label: monitoringStations[0].label,
            riverName: monitoringStations[0].riverName
          },
          {
            catchmentName: monitoringStations[1].catchmentName,
            gridReference: monitoringStations[1].gridReference,
            id: monitoringStations[1].id,
            label: monitoringStations[1].label,
            riverName: monitoringStations[1].riverName
          }
        ],
        total: 3
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
      const result = await FetchMonitoringStationSearchResultsService.go('TESTSEARCH', 2)

      expect(result).to.equal({
        results: [
          {
            catchmentName: monitoringStations[0].catchmentName,
            gridReference: monitoringStations[0].gridReference,
            id: monitoringStations[0].id,
            label: monitoringStations[0].label,
            riverName: monitoringStations[0].riverName
          }
        ],
        total: 3
      })
    })
  })

  describe('when no matching monitoring stations exist', () => {
    it('returns empty query results', async () => {
      const result = await FetchMonitoringStationSearchResultsService.go('TESTSEARCH99', 1)

      expect(result).to.equal({
        results: [],
        total: 0
      })
    })
  })
})
