'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceMonitoringStationHelper = require('../../../support/helpers/licence-monitoring-station.helper.js')

// Thing under test
const UpdateAbstractionAlertsService = require('../../../../app/services/jobs/notification-status/update-abstraction-alerts.service.js')

describe('Job - Notification Status - Update Abstraction Alerts service', () => {
  let licenceMonitoringStation
  let licenceMonitoringStationUnTouched
  let notification

  beforeEach(async () => {
    licenceMonitoringStation = await LicenceMonitoringStationHelper.add({
      status: 'stop',
      statusUpdatedAt: new Date('2025-08-11')
    })

    licenceMonitoringStationUnTouched = await LicenceMonitoringStationHelper.add({
      status: 'warning',
      statusUpdatedAt: new Date('2025-08-02')
    })

    notification = {
      createdAt: new Date(),
      messageRef: 'water_abstraction_alert_resume_email',
      personalisation: {
        licenceGaugingStationId: licenceMonitoringStation.id,
        sending_alert_type: 'resume'
      },
      status: 'sent'
    }
  })

  describe('when a notice has been successful', () => {
    it('updates the "status" and "statusUpdatedAt" of the matching licence monitoring station', async () => {
      await UpdateAbstractionAlertsService.go([notification])

      const updatedResult = await licenceMonitoringStation.$query()

      expect(updatedResult.status).to.equal('resume')
      expect(updatedResult.statusUpdatedAt).to.equal(notification.createdAt)
    })

    it('does not update other licence monitoring stations', async () => {
      await UpdateAbstractionAlertsService.go([notification])

      const updatedResult = await licenceMonitoringStationUnTouched.$query()

      expect(updatedResult.status).to.equal('warning')
      expect(updatedResult.statusUpdatedAt).to.equal(new Date('2025-08-02'))
    })
  })

  describe('when a notice has failed', () => {
    beforeEach(() => {
      notification = {
        createdAt: new Date(),
        messageRef: 'water_abstraction_alert_resume_email',
        personalisation: {
          licenceGaugingStationId: licenceMonitoringStation.id,
          sending_alert_type: 'resume'
        },
        status: 'error'
      }
    })

    it('does not update the "status" and "statusUpdatedAt"', async () => {
      await UpdateAbstractionAlertsService.go([notification])

      const updatedResult = await licenceMonitoringStation.$query()

      expect(updatedResult.status).to.equal('stop')
      expect(updatedResult.statusUpdatedAt).to.equal(new Date('2025-08-11'))
    })
  })
})
