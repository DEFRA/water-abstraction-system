'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateRandomInteger } = require('../../../app/lib/general.lib.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceMonitoringStationHelper = require('../../support/helpers/licence-monitoring-station.helper.js')
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')
const LicenceVersionPurposeHelper = require('../../support/helpers/licence-version-purpose.helper.js')
const LicenceVersionPurposeConditionHelper = require('../../support/helpers/licence-version-purpose-condition.helper.js')
const MonitoringStationHelper = require('../../support/helpers/monitoring-station.helper.js')
const PointHelper = require('../../support/helpers/point.helper.js')

// Thing under test
const FetchMonitoringStationDetailsService = require('../../../app/services/monitoring-stations/fetch-monitoring-station-details.service.js')

describe('Monitoring Stations - Fetch Monitoring Station Details service', () => {
  let monitoringStation
  let licenceMonitoringStationOne
  let licenceMonitoringStationTwo
  let licenceMonitoringStationThree
  let licenceOne
  let licenceTwo

  describe('when a matching monitoring station exists', () => {
    beforeEach(async () => {
      monitoringStation = await MonitoringStationHelper.add({
        gridReference: PointHelper.generateNationalGridReference(),
        label: 'GROSSE POINT BLANK'
      })
    })

    describe('and it has tagged licences with restrictions', () => {
      beforeEach(async () => {
        // NOTE: We control the licence references used to assert the licence sorting is working as expected
        licenceOne = { licence: await LicenceHelper.add({ licenceRef: `02/02/02/${generateRandomInteger(1, 9999)}` }) }

        const licenceVersion = await LicenceVersionHelper.add({ licenceId: licenceOne.licence.id })

        licenceOne.purpose = await LicenceVersionPurposeHelper.add({ licenceVersionId: licenceVersion.id })
        licenceOne.purposeCondition = await LicenceVersionPurposeConditionHelper.add({
          licenceVersionPurposeId: licenceOne.purpose.id
        })

        licenceMonitoringStationOne = await LicenceMonitoringStationHelper.add({
          licenceId: licenceOne.licence.id,
          licenceVersionPurposeConditionId: licenceOne.purposeCondition.id,
          monitoringStationId: monitoringStation.id
        })

        licenceTwo = { licence: await LicenceHelper.add({ licenceRef: `01/01/01/${generateRandomInteger(1, 9999)}` }) }
        licenceMonitoringStationTwo = await LicenceMonitoringStationHelper.add({
          licenceId: licenceTwo.licence.id,
          monitoringStationId: monitoringStation.id
        })

        // NOTE: We set the threshold used to assert the restriction sorting is working as expected
        licenceMonitoringStationThree = await LicenceMonitoringStationHelper.add({
          licenceId: licenceTwo.licence.id,
          monitoringStationId: monitoringStation.id,
          thresholdUnit: 'm3/s',
          thresholdValue: 150
        })

        // NOTE: Final check that we are only returning non-deleted monitoring licence stations
        await LicenceMonitoringStationHelper.add({
          deletedAt: new Date('2024-11-17'),
          licenceId: licenceTwo.licence.id,
          monitoringStationId: monitoringStation.id
        })
      })

      it('returns the matching monitoring station with its licence monitoring stations correctly ordered', async () => {
        const result = await FetchMonitoringStationDetailsService.go(monitoringStation.id)

        expect(result.monitoringStation).to.equal({
          catchmentName: null,
          gridReference: monitoringStation.gridReference,
          id: monitoringStation.id,
          label: 'GROSSE POINT BLANK',
          riverName: null,
          stationReference: null,
          wiskiId: null
        })

        expect(result.licenceMonitoringStations).to.equal([
          {
            id: licenceMonitoringStationThree.id,
            abstractionPeriodEndDay: null,
            abstractionPeriodEndMonth: null,
            abstractionPeriodStartDay: null,
            abstractionPeriodStartMonth: null,
            measureType: 'flow',
            restrictionType: 'reduce',
            thresholdUnit: 'm3/s',
            thresholdValue: 150,
            licence: {
              id: licenceTwo.licence.id,
              licenceRef: licenceTwo.licence.licenceRef
            },
            licenceVersionPurposeCondition: null
          },
          {
            id: licenceMonitoringStationTwo.id,
            abstractionPeriodEndDay: null,
            abstractionPeriodEndMonth: null,
            abstractionPeriodStartDay: null,
            abstractionPeriodStartMonth: null,
            measureType: 'flow',
            restrictionType: 'reduce',
            thresholdUnit: 'm3/s',
            thresholdValue: 100,
            licence: {
              id: licenceTwo.licence.id,
              licenceRef: licenceTwo.licence.licenceRef
            },
            licenceVersionPurposeCondition: null
          },
          {
            id: licenceMonitoringStationOne.id,
            abstractionPeriodEndDay: null,
            abstractionPeriodEndMonth: null,
            abstractionPeriodStartDay: null,
            abstractionPeriodStartMonth: null,
            measureType: 'flow',
            restrictionType: 'reduce',
            thresholdUnit: 'm3/s',
            thresholdValue: 100,
            licence: {
              id: licenceOne.licence.id,
              licenceRef: licenceOne.licence.licenceRef
            },
            licenceVersionPurposeCondition: {
              id: licenceOne.purposeCondition.id,
              licenceVersionPurpose: {
                id: licenceOne.purpose.id,
                abstractionPeriodEndDay: 31,
                abstractionPeriodEndMonth: 3,
                abstractionPeriodStartDay: 1,
                abstractionPeriodStartMonth: 1
              }
            }
          }
        ])
      })
    })

    describe('but it has no tagged licences with restrictions', () => {
      it('returns the matching monitoring station with no licence monitoring stations', async () => {
        const result = await FetchMonitoringStationDetailsService.go(monitoringStation.id)

        expect(result.monitoringStation).to.equal({
          catchmentName: null,
          gridReference: monitoringStation.gridReference,
          id: monitoringStation.id,
          label: 'GROSSE POINT BLANK',
          riverName: null,
          stationReference: null,
          wiskiId: null
        })

        expect(result.licenceMonitoringStations).to.equal([])
      })
    })
  })

  describe('when no matching monitoring station exists', () => {
    it('returns empty values', async () => {
      const result = await FetchMonitoringStationDetailsService.go('dfa47d48-0c98-4707-a5b8-820eb16c1dfd')

      expect(result.monitoringStation).to.be.undefined()
      expect(result.licenceMonitoringStations).to.equal([])
    })
  })
})
