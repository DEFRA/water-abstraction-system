'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const FetchLicenceMonitoringStationService = require('../../../app/services/licence-monitoring-station/fetch-licence-monitoring-station.service.js')

// Thing under test
const RemoveService = require('../../../app/services/licence-monitoring-station/remove.service.js')

describe('Licence Monitoring Station - Remove service', () => {
  const licenceId = '7603de03-8147-42a3-9579-3948cb781c91'
  const licenceMonitoringStationId = '294eb325-1694-40c4-bdb1-8bbe8ebee767'
  const monitoringStationId = '58a48c2a-f749-4831-af71-d86b74cb03b2'

  beforeEach(() => {
    const licenceMonitoringStation = {
      id: licenceMonitoringStationId,
      measureType: 'flow',
      restrictionType: 'reduce',
      thresholdUnit: 'm3/s',
      thresholdValue: 100,
      monitoringStation: {
        id: monitoringStationId,
        catchmentName: 'The Catchment',
        label: 'The Monitoring Station',
        riverName: 'The River'
      },
      licence: {
        id: licenceId,
        licenceRef: '99/999/9999'
      },
      licenceVersionPurposeCondition: null
    }

    Sinon.stub(FetchLicenceMonitoringStationService, 'go').resolves(licenceMonitoringStation)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns the page data for the view', async () => {
      const result = await RemoveService.go(licenceMonitoringStationId)

      expect(result).to.equal({
        activeNavBar: 'search',
        backLink: `/system/monitoring-stations/${monitoringStationId}/licence/${licenceId}`,
        licenceConditionTitle: 'Hands off flow threshold',
        licenceRef: '99/999/9999',
        linkedCondition: 'Not linked to a condition',
        monitoringStationId,
        pageTitle: 'You’re about to remove the tag for this licence',
        station: 'The River at The Monitoring Station',
        threshold: '100m3/s',
        type: 'Reduce',
        Watercourse: 'The Catchment'
      })
    })
  })
})
