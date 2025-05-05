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
const FetchMonitoringStationService = require('../../../app/services/monitoring-stations/fetch-monitoring-station.service.js')

describe('Monitoring Stations - Fetch Monitoring Station service', () => {
  let monitoringStation
  let licenceMonitoringStationOne
  let licenceMonitoringStationTwo
  let licenceMonitoringStationThree
  let licenceWithCondition
  let licenceWithoutConditions
  let licenceWithConditionPurpose
  let licenceWithConditionPurposeCondition

  describe('when a matching monitoring station exists', () => {
    describe('and it has no tagged licences with restrictions', () => {
      beforeEach(async () => {
        monitoringStation = await MonitoringStationHelper.add({
          gridReference: PointHelper.generateNationalGridReference(),
          label: 'LONELY POINT'
        })
      })

      it('returns the matching monitoring station with no licence monitoring stations', async () => {
        const result = await FetchMonitoringStationService.go(monitoringStation.id)

        expect(result).to.equal({
          id: monitoringStation.id,
          gridReference: monitoringStation.gridReference,
          label: 'LONELY POINT',
          riverName: null,
          stationReference: null,
          wiskiId: null,
          licenceMonitoringStations: []
        })
      })
    })

    describe('and it has tagged licences with restrictions', () => {
      beforeEach(async () => {
        monitoringStation = await MonitoringStationHelper.add({
          gridReference: PointHelper.generateNationalGridReference(),
          label: 'BUSY POINT'
        })

        // NOTE: We control the licence references used to assert the licence sorting is working as expected
        licenceWithCondition = await LicenceHelper.add({ licenceRef: `02/02/02/${generateRandomInteger(1, 9999)}` })
        const licenceVersion = await LicenceVersionHelper.add({ licenceId: licenceWithCondition.id })

        licenceWithConditionPurpose = await LicenceVersionPurposeHelper.add({ licenceVersionId: licenceVersion.id })
        licenceWithConditionPurposeCondition = await LicenceVersionPurposeConditionHelper.add({
          licenceVersionPurposeId: licenceWithConditionPurpose.id
        })
        licenceMonitoringStationOne = await LicenceMonitoringStationHelper.add({
          licenceId: licenceWithCondition.id,
          licenceVersionPurposeConditionId: licenceWithConditionPurposeCondition.id,
          monitoringStationId: monitoringStation.id
        })

        licenceWithoutConditions = await LicenceHelper.add({ licenceRef: `01/01/01/${generateRandomInteger(1, 9999)}` })
        licenceMonitoringStationTwo = await LicenceMonitoringStationHelper.add({
          licenceId: licenceWithoutConditions.id,
          monitoringStationId: monitoringStation.id
        })
        // NOTE: We set the threshold used to assert the restriction sorting is working as expected
        licenceMonitoringStationThree = await LicenceMonitoringStationHelper.add({
          licenceId: licenceWithoutConditions.id,
          monitoringStationId: monitoringStation.id,
          thresholdUnit: 'm3/s',
          thresholdValue: 150
        })
        // NOTE: Final check that we are only returning non-deleted monitoring licence stations
        await LicenceMonitoringStationHelper.add({
          deletedAt: new Date('2024-11-17'),
          licenceId: licenceWithoutConditions.id,
          monitoringStationId: monitoringStation.id
        })
      })

      it('returns the matching monitoring station with its licence monitoring stations correctly ordered', async () => {
        const result = await FetchMonitoringStationService.go(monitoringStation.id)

        expect(result).to.equal({
          id: monitoringStation.id,
          gridReference: monitoringStation.gridReference,
          label: 'BUSY POINT',
          riverName: null,
          stationReference: null,
          wiskiId: null,
          licenceMonitoringStations: [
            {
              id: licenceMonitoringStationThree.id,
              abstractionPeriodEndDay: null,
              abstractionPeriodEndMonth: null,
              abstractionPeriodStartDay: null,
              abstractionPeriodStartMonth: null,
              licence: {
                id: licenceWithoutConditions.id,
                licenceRef: licenceWithoutConditions.licenceRef
              },
              licenceId: licenceWithoutConditions.id,
              licenceVersionPurposeCondition: null,
              measureType: 'flow',
              restrictionType: 'reduce',
              status: 'resume',
              statusUpdatedAt: null,
              thresholdUnit: 'm3/s',
              thresholdValue: 150
            },
            {
              id: licenceMonitoringStationTwo.id,
              abstractionPeriodEndDay: null,
              abstractionPeriodEndMonth: null,
              abstractionPeriodStartDay: null,
              abstractionPeriodStartMonth: null,
              licence: {
                id: licenceWithoutConditions.id,
                licenceRef: licenceWithoutConditions.licenceRef
              },
              licenceId: licenceWithoutConditions.id,
              licenceVersionPurposeCondition: null,
              measureType: 'flow',
              restrictionType: 'reduce',
              status: 'resume',
              statusUpdatedAt: null,
              thresholdUnit: 'm3/s',
              thresholdValue: 100
            },
            {
              id: licenceMonitoringStationOne.id,
              abstractionPeriodEndDay: null,
              abstractionPeriodEndMonth: null,
              abstractionPeriodStartDay: null,
              abstractionPeriodStartMonth: null,
              licence: {
                id: licenceWithCondition.id,
                licenceRef: licenceWithCondition.licenceRef
              },
              licenceId: licenceWithCondition.id,
              licenceVersionPurposeCondition: {
                id: licenceWithConditionPurposeCondition.id,
                licenceVersionPurpose: {
                  id: licenceWithConditionPurpose.id,
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
    })
  })

  describe('when no matching monitoring station exists', () => {
    it('returns nothing', async () => {
      const result = await FetchMonitoringStationService.go('dfa47d48-0c98-4707-a5b8-820eb16c1dfd')

      expect(result).to.be.undefined()
    })
  })
})
