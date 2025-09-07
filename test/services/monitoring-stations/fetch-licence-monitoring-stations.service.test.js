'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach, afterEach, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceMonitoringStationHelper = require('../../support/helpers/licence-monitoring-station.helper.js')
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')
const LicenceVersionPurposeHelper = require('../../support/helpers/licence-version-purpose.helper.js')
const LicenceVersionPurposeConditionHelper = require('../../support/helpers/licence-version-purpose-condition.helper.js')
const LicenceVersionPurposeConditionTypeHelper = require('../../support/helpers/licence-version-purpose-condition-type.helper.js')
const MonitoringStationHelper = require('../../support/helpers/monitoring-station.helper.js')
const UserHelper = require('../../support/helpers/user.helper.js')

// Thing under test
const FetchLicenceMonitoringStationsService = require('../../../app/services/monitoring-stations/fetch-licence-monitoring-stations.service.js')

describe('Monitoring Stations - Fetch Licence Monitoring Stations service', () => {
  let licence
  let licenceMonitoringStations
  let licenceVersion
  let licenceVersionPurpose
  let licenceVersionPurposeCondition
  let licenceVersionPurposeConditionType
  let monitoringStation
  let user

  before(async () => {
    licenceVersionPurposeConditionType = await LicenceVersionPurposeConditionTypeHelper.select()
    user = UserHelper.select()

    monitoringStation = await MonitoringStationHelper.add({
      label: 'The Monitoring Station',
      riverName: 'The River'
    })

    licence = await LicenceHelper.add()
    licenceVersion = await LicenceVersionHelper.add({ licenceId: licence.id })
    licenceVersionPurpose = await LicenceVersionPurposeHelper.add({ licenceVersionId: licenceVersion.id })
    licenceVersionPurposeCondition = await LicenceVersionPurposeConditionHelper.add({
      licenceVersionPurposeConditionTypeId: licenceVersionPurposeConditionType.id,
      licenceVersionPurposeId: licenceVersionPurpose.id,
      notes: 'This is the effect of restriction'
    })
  })

  beforeEach(() => {
    licenceMonitoringStations = []
  })

  afterEach(async () => {
    for (const licenceMonitoringStation of licenceMonitoringStations) {
      await licenceMonitoringStation.$query().delete()
    }
  })

  after(async () => {
    await licenceVersionPurposeCondition.$query().delete()
    await licenceVersionPurpose.$query().delete()
    await licenceVersion.$query().delete()
    await licence.$query().delete()
    await monitoringStation.$query().delete()
  })

  describe('when a matching monitoring station and licence exists', () => {
    describe('and licence monitoring station records exist for them', () => {
      beforeEach(async () => {
        let licenceMonitoringStation = await LicenceMonitoringStationHelper.add({
          createdBy: user.id,
          licenceId: licence.id,
          licenceVersionPurposeConditionId: licenceVersionPurposeCondition.id,
          monitoringStationId: monitoringStation.id,
          restrictionType: 'stop',
          status: 'resume',
          statusUpdatedAt: new Date('2025-08-26 21:22:05')
        })
        licenceMonitoringStations.push(licenceMonitoringStation)

        licenceMonitoringStation = await LicenceMonitoringStationHelper.add({
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 4,
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 3,
          createdBy: user.id,
          licenceId: licence.id,
          monitoringStationId: monitoringStation.id,
          restrictionType: 'reduce',
          thresholdValue: 500
        })
        licenceMonitoringStations.push(licenceMonitoringStation)

        licenceMonitoringStation = await LicenceMonitoringStationHelper.add({
          createdBy: user.id,
          deletedAt: new Date('2025-08-27 21:22:05'),
          licenceId: licence.id,
          licenceVersionPurposeConditionId: licenceVersionPurposeCondition.id,
          monitoringStationId: monitoringStation.id,
          restrictionType: 'stop',
          status: 'resume',
          statusUpdatedAt: new Date('2025-08-26 21:22:05')
        })
        licenceMonitoringStations.push(licenceMonitoringStation)
      })

      it('returns the licence, monitoring station and non-deleted licence monitoring station records', async () => {
        const result = await FetchLicenceMonitoringStationsService.go(licence.id, monitoringStation.id)

        expect(result.licence).to.equal({ id: licence.id, licenceRef: licence.licenceRef })
        expect(result.monitoringStation).to.equal({
          id: monitoringStation.id,
          label: 'The Monitoring Station',
          riverName: 'The River'
        })

        expect(result.licenceMonitoringStations).to.equal([
          {
            createdAt: licenceMonitoringStations[1].createdAt,
            id: licenceMonitoringStations[1].id,
            licenceVersionPurposeCondition: null,
            restrictionType: licenceMonitoringStations[1].restrictionType,
            status: licenceMonitoringStations[1].status,
            statusUpdatedAt: licenceMonitoringStations[1].statusUpdatedAt,
            thresholdUnit: licenceMonitoringStations[1].thresholdUnit,
            thresholdValue: licenceMonitoringStations[1].thresholdValue,
            user: { id: user.id, username: user.username }
          },
          {
            createdAt: licenceMonitoringStations[0].createdAt,
            id: licenceMonitoringStations[0].id,
            licenceVersionPurposeCondition: {
              externalId: licenceVersionPurposeCondition.externalId,
              id: licenceVersionPurposeCondition.id,
              notes: licenceVersionPurposeCondition.notes,
              licenceVersionPurpose: {
                id: licenceVersionPurpose.id,
                licenceVersion: { id: licenceVersion.id, status: licenceVersion.status }
              },
              licenceVersionPurposeConditionType: {
                displayTitle: licenceVersionPurposeConditionType.displayTitle,
                id: licenceVersionPurposeConditionType.id
              }
            },
            restrictionType: licenceMonitoringStations[0].restrictionType,
            status: licenceMonitoringStations[0].status,
            statusUpdatedAt: licenceMonitoringStations[0].statusUpdatedAt,
            thresholdUnit: licenceMonitoringStations[0].thresholdUnit,
            thresholdValue: licenceMonitoringStations[0].thresholdValue,
            user: { id: user.id, username: user.username }
          }
        ])
      })
    })

    describe('but no licence monitoring station records exist for them', () => {
      it('returns the licence, monitoring station but no licence monitoring station records', async () => {
        const result = await FetchLicenceMonitoringStationsService.go(licence.id, monitoringStation.id)

        expect(result.licence).to.equal({ id: licence.id, licenceRef: licence.licenceRef })
        expect(result.monitoringStation).to.equal({
          id: monitoringStation.id,
          label: 'The Monitoring Station',
          riverName: 'The River'
        })

        expect(result.licenceMonitoringStations).to.be.empty()
      })
    })
  })

  describe('when a matching monitoring station does not exist', () => {
    it('returns only the licence record populated', async () => {
      const result = await FetchLicenceMonitoringStationsService.go(licence.id, '1dcbafad-a1c6-43ec-9313-7149b40ffa57')

      expect(result.licence).to.equal({ id: licence.id, licenceRef: licence.licenceRef })
      expect(result.monitoringStation).to.be.undefined()
      expect(result.licenceMonitoringStations).to.be.empty()
    })
  })

  describe('when a matching licence does not exist', () => {
    it('returns only the monitoring station record populated', async () => {
      const result = await FetchLicenceMonitoringStationsService.go(
        '86cb402a-5122-407a-beea-3f5422133e55',
        monitoringStation.id
      )

      expect(result.licence).to.be.undefined()
      expect(result.monitoringStation).to.equal({
        id: monitoringStation.id,
        label: 'The Monitoring Station',
        riverName: 'The River'
      })
      expect(result.licenceMonitoringStations).to.be.empty()
    })
  })

  // describe('when a matching licence monitoring station exists', () => {
  //   let licence
  //   let licenceMonitoringStation
  //   let licenceVersionPurposeCondition
  //   let licenceVersionPurposeId

  //   beforeEach(async () => {
  //     licence = await LicenceHelper.add()

  //     const { id: licenceVersionId } = await LicenceVersionHelper.add({ licenceId: licence.id })

  //     const licenceVersionPurpose = await LicenceVersionPurposeHelper.add({ licenceVersionId })
  //     licenceVersionPurposeId = licenceVersionPurpose.id

  //     const { id: licenceVersionPurposeConditionTypeId } = LicenceVersionPurposeConditionTypeHelper.select(22)

  //     licenceVersionPurposeCondition = await LicenceVersionPurposeConditionHelper.add({
  //       licenceVersionPurposeId,
  //       licenceVersionPurposeConditionTypeId,
  //       notes: 'This is the effect of restriction'
  //     })

  //     const { id: userId } = await UserHelper.add({ username: 'station-monitor@wrls.gov.uk' })

  //     licenceMonitoringStation = await LicenceMonitoringStationHelper.add({
  //       createdAt: new Date('2025-05-20'),
  //       createdBy: userId,
  //       licenceId: licence.id,
  //       licenceVersionPurposeConditionId: licenceVersionPurposeCondition.id,
  //       monitoringStationId: monitoringStation.id,
  //       restrictionType: 'reduce'
  //     })
  //   })

  //   it('returns the matching data', async () => {
  //     const result = await FetchLicenceMonitoringStationsService.go(licence.id, monitoringStation.id)

  //     expect(result.monitoringStationLicenceTags).to.equal({
  //       id: monitoringStation.id,
  //       label: 'The Monitoring Station',
  //       riverName: 'The River',
  //       licenceMonitoringStations: [
  //         {
  //           id: licenceMonitoringStation.id,
  //           createdAt: new Date('2025-05-20'),
  //           licenceId: licence.id,
  //           restrictionType: 'reduce',
  //           thresholdUnit: 'm3/s',
  //           thresholdValue: 100,
  //           licence: { licenceRef: licence.licenceRef },
  //           licenceVersionPurposeCondition: {
  //             externalId: licenceVersionPurposeCondition.externalId,
  //             notes: 'This is the effect of restriction',
  //             licenceVersionPurpose: {
  //               id: licenceVersionPurposeId,
  //               licenceVersion: { status: 'current' }
  //             },
  //             licenceVersionPurposeConditionType: {
  //               displayTitle: 'Flow cessation condition'
  //             }
  //           },
  //           user: { username: 'station-monitor@wrls.gov.uk' }
  //         }
  //       ]
  //     })
  //   })
  // })
})
