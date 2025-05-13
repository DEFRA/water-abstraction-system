'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../../support/helpers/licence.helper.js')
const LicenceMonitoringStationHelper = require('../../../../support/helpers/licence-monitoring-station.helper.js')
const LicenceVersionPurposeConditionHelper = require('../../../../support/helpers/licence-version-purpose-condition.helper.js')
const LicenceVersionPurposesHelper = require('../../../../support/helpers/licence-version-purpose.helper.js')
const MonitoringStationHelper = require('../../../../support/helpers/monitoring-station.helper.js')
const { generateRandomInteger } = require('../../../../../app/lib/general.lib.js')

// Thing under test
const FetchMonitoringStationService = require('../../../../../app/services/notices/setup/abstraction-alerts/fetch-monitoring-station.service.js')

describe('Notices Setup - Abstraction Alerts - Fetch Monitoring Station service', () => {
  let licence
  let licenceVersionPurpose
  let licenceVersionPurposeCondition
  let licenceWithVersionPurpose
  let monitoringStation

  beforeEach(async () => {
    monitoringStation = await MonitoringStationHelper.add()

    // A licence with the abstraction data from the Licence monitoring station
    licence = await LicenceHelper.add({ licenceRef: `01/01/01/${generateRandomInteger(1, 9999)}` })

    await LicenceMonitoringStationHelper.add({
      licenceId: licence.id,
      monitoringStationId: monitoringStation.id,
      abstractionPeriodEndDay: '01',
      abstractionPeriodEndMonth: '01',
      abstractionPeriodStartDay: '01',
      abstractionPeriodStartMonth: '02'
    })

    // A licence with the abstraction data from the licence version purpose
    licenceWithVersionPurpose = await LicenceHelper.add({ licenceRef: `02/02/02/${generateRandomInteger(1, 9999)}` })

    licenceVersionPurpose = await LicenceVersionPurposesHelper.add()

    licenceVersionPurposeCondition = await LicenceVersionPurposeConditionHelper.add({
      licenceVersionPurposeId: licenceVersionPurpose.id
    })

    await LicenceMonitoringStationHelper.add({
      licenceId: licenceWithVersionPurpose.id,
      licenceVersionPurposeConditionId: licenceVersionPurposeCondition.id,
      monitoringStationId: monitoringStation.id
    })
  })

  it('correctly returns the data', async () => {
    const result = await FetchMonitoringStationService.go(monitoringStation.id)

    expect(result).to.equal({
      id: monitoringStation.id,
      label: 'MONITOR PLACE',
      licenceMonitoringStations: [
        {
          abstractionPeriodEndDay: 1,
          abstractionPeriodEndMonth: 1,
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 2,
          licence: {
            id: licence.id,
            licenceRef: licence.licenceRef
          },
          licenceVersionPurposeCondition: null,
          measureType: 'flow',
          restrictionType: 'reduce',
          status: 'resume',
          statusUpdatedAt: null,
          thresholdUnit: 'm3/s',
          thresholdValue: 100
        },
        {
          abstractionPeriodEndDay: null,
          abstractionPeriodEndMonth: null,
          abstractionPeriodStartDay: null,
          abstractionPeriodStartMonth: null,
          licence: {
            id: licenceWithVersionPurpose.id,
            licenceRef: licenceWithVersionPurpose.licenceRef
          },
          licenceVersionPurposeCondition: {
            id: licenceVersionPurposeCondition.id,
            licenceVersionPurpose: {
              abstractionPeriodEndDay: 31,
              abstractionPeriodEndMonth: 3,
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 1
            }
          },
          measureType: 'flow',
          restrictionType: 'reduce',
          status: 'resume',
          statusUpdatedAt: null,
          thresholdUnit: 'm3/s',
          thresholdValue: 100
        }
      ]
    })
  })

  describe('when the licence has a licence version purpose', () => {
    it('correctly returns the data', async () => {
      const result = await FetchMonitoringStationService.go(monitoringStation.id)

      expect(result.licenceMonitoringStations[1]).to.equal({
        abstractionPeriodEndDay: null,
        abstractionPeriodEndMonth: null,
        abstractionPeriodStartDay: null,
        abstractionPeriodStartMonth: null,
        licence: {
          id: licenceWithVersionPurpose.id,
          licenceRef: licenceWithVersionPurpose.licenceRef
        },
        licenceVersionPurposeCondition: {
          id: licenceVersionPurposeCondition.id,
          licenceVersionPurpose: {
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 3,
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 1
          }
        },
        measureType: 'flow',
        restrictionType: 'reduce',
        status: 'resume',
        statusUpdatedAt: null,
        thresholdUnit: 'm3/s',
        thresholdValue: 100
      })
    })
  })

  describe('when the licence does not have a licence version purpose', () => {
    it('correctly returns the data', async () => {
      const result = await FetchMonitoringStationService.go(monitoringStation.id)

      expect(result.licenceMonitoringStations[0]).to.equal({
        abstractionPeriodEndDay: 1,
        abstractionPeriodEndMonth: 1,
        abstractionPeriodStartDay: 1,
        abstractionPeriodStartMonth: 2,
        licence: {
          id: licence.id,
          licenceRef: licence.licenceRef
        },
        licenceVersionPurposeCondition: null,
        measureType: 'flow',
        restrictionType: 'reduce',
        status: 'resume',
        statusUpdatedAt: null,
        thresholdUnit: 'm3/s',
        thresholdValue: 100
      })
    })
  })
})
