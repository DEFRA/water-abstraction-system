'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../app/lib/general.lib.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceMonitoringStationHelper = require('../../support/helpers/licence-monitoring-station.helper.js')
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')
const LicenceVersionPurposeHelper = require('../../support/helpers/licence-version-purpose.helper.js')
const LicenceVersionPurposeConditionHelper = require('../../support/helpers/licence-version-purpose-condition.helper.js')
const LicenceVersionPurposeConditionTypeHelper = require('../../support/helpers/licence-version-purpose-condition-type.helper.js')
const MonitoringStationHelper = require('../../support/helpers/monitoring-station.helper.js')
const NotificationHelper = require('../../support/helpers/notification.helper.js')
const UserHelper = require('../../support/helpers/user.helper.js')

// Thing under test
const FetchLicenceTagDetailsService = require('../../../app/services/monitoring-stations/fetch-licence-tag-details.service.js')

describe('Monitoring Stations - Fetch Licence Tag Details service', () => {
  let monitoringStation

  before(async () => {
    monitoringStation = await MonitoringStationHelper.add({
      label: 'The Monitoring Station',
      riverName: 'The River'
    })
  })

  describe('when fetching details of the last alert sent', () => {
    let licenceId

    beforeEach(() => {
      licenceId = generateUUID()
    })

    describe('and NO alerts exist for the licence', () => {
      it('returns nothing', async () => {
        const result = await FetchLicenceTagDetailsService.go(licenceId, monitoringStation.id)

        expect(result.lastAlert).to.be.undefined()
      })
    })

    describe('and alerts exist for the licence', () => {
      beforeEach(async () => {
        const licence = await LicenceHelper.add()
        licenceId = licence.id

        await _createAlerts(licenceId)
      })

      it('returns the latest sent water abstraction alert', async () => {
        const result = await FetchLicenceTagDetailsService.go(licenceId, monitoringStation.id)

        expect(result.lastAlert).to.equal(
          {
            alertType: 'stop',
            contact: 'Big Farm Two',
            createdAt: new Date('2025-04-17'),
            messageRef: 'water_abstraction_alert_stop',
            messageType: 'letter',
            recipient: null,
            sendingAlertType: 'stop',
            status: 'sent'
          },
          { skip: 'id' }
        )
      })
    })
  })

  describe('when a matching licence monitoring station exists', () => {
    let licence
    let licenceMonitoringStation
    let licenceVersionPurposeCondition
    let licenceVersionPurposeId

    beforeEach(async () => {
      licence = await LicenceHelper.add()

      const { id: licenceVersionId } = await LicenceVersionHelper.add({ licenceId: licence.id })

      const licenceVersionPurpose = await LicenceVersionPurposeHelper.add({ licenceVersionId })
      licenceVersionPurposeId = licenceVersionPurpose.id

      const { id: licenceVersionPurposeConditionTypeId } = LicenceVersionPurposeConditionTypeHelper.select(22)

      licenceVersionPurposeCondition = await LicenceVersionPurposeConditionHelper.add({
        licenceVersionPurposeId,
        licenceVersionPurposeConditionTypeId,
        notes: 'This is the effect of restriction'
      })

      const { id: userId } = await UserHelper.add({ username: 'station-monitor@wrls.gov.uk' })

      licenceMonitoringStation = await LicenceMonitoringStationHelper.add({
        createdAt: new Date('2025-05-20'),
        createdBy: userId,
        licenceId: licence.id,
        licenceVersionPurposeConditionId: licenceVersionPurposeCondition.id,
        monitoringStationId: monitoringStation.id,
        restrictionType: 'reduce'
      })
    })

    it('returns the matching data', async () => {
      const result = await FetchLicenceTagDetailsService.go(licence.id, monitoringStation.id)

      expect(result.monitoringStationLicenceTags).to.equal({
        id: monitoringStation.id,
        label: 'The Monitoring Station',
        riverName: 'The River',
        licenceMonitoringStations: [
          {
            id: licenceMonitoringStation.id,
            createdAt: new Date('2025-05-20'),
            licenceId: licence.id,
            restrictionType: 'reduce',
            thresholdUnit: 'm3/s',
            thresholdValue: 100,
            licence: { licenceRef: licence.licenceRef },
            licenceVersionPurposeCondition: {
              externalId: licenceVersionPurposeCondition.externalId,
              notes: 'This is the effect of restriction',
              licenceVersionPurpose: {
                id: licenceVersionPurposeId,
                licenceVersion: { status: 'current' }
              },
              licenceVersionPurposeConditionType: {
                displayTitle: 'Flow cessation condition'
              }
            },
            user: { username: 'station-monitor@wrls.gov.uk' }
          }
        ]
      })
    })
  })
})

async function _createAlerts(licenceId) {
  // Won't get picked up as not the latest
  await NotificationHelper.add({
    createdAt: new Date('2024-08-13'),
    messageRef: 'water_abstraction_alert_stop_warning',
    messageType: 'letter',
    personalisation: {
      alertType: 'reduce',
      address_line_1: 'Big Farm One',
      licenceId,
      sending_alert_type: 'warning'
    },
    status: 'sent'
  })

  // Will get picked up as it is the latest
  await NotificationHelper.add({
    createdAt: new Date('2025-04-17'),
    messageRef: 'water_abstraction_alert_stop',
    messageType: 'letter',
    personalisation: {
      alertType: 'stop',
      address_line_1: 'Big Farm Two',
      licenceId,
      sending_alert_type: 'stop'
    },
    status: 'sent'
  })

  // Won't get picked up as the status is draft
  await NotificationHelper.add({
    createdAt: new Date('2025-04-16'),
    messageRef: 'water_abstraction_alert_stop',
    messageType: 'letter',
    personalisation: {
      alertType: 'stop',
      address_line_1: 'Big Farm Three',
      licenceId,
      sending_alert_type: 'stop'
    },
    status: 'draft'
  })
}
