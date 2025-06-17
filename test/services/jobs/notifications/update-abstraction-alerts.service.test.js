'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceMonitoringStationHelper = require('../../../support/helpers/licence-monitoring-station.helper.js')

// Thing under test
const UpdateAbstractionAlertsService = require('../../../../app/services/jobs/notifications/update-abstraction-alerts.service.js')

describe('Job - Notifications - Update abstraction alerts service', () => {
  let clock
  let date
  let licenceMonitoringStation
  let licenceMonitoringStationUnTouched
  let notifications

  beforeEach(async () => {
    licenceMonitoringStation = await LicenceMonitoringStationHelper.add()

    licenceMonitoringStationUnTouched = await LicenceMonitoringStationHelper.add()

    notifications = [
      {
        messageRef: 'water_abstraction_alert_resume_email',
        personalisation: {
          alertType: 'resume',
          licenceMonitoringStationId: licenceMonitoringStation.id
        }
      }
    ]

    date = new Date(`2025-01-01`)
    clock = Sinon.useFakeTimers(date)
  })

  afterEach(() => {
    Sinon.restore()
    clock.restore()
  })

  it('updates the "status" and "statusUpdatedAt"', async () => {
    await UpdateAbstractionAlertsService.go(notifications)

    const updatedResult = await licenceMonitoringStation.$query()

    expect(updatedResult.status).to.equal('resume')
    expect(updatedResult.statusUpdatedAt).to.equal(date)
  })

  it('does nto update ', async () => {
    await UpdateAbstractionAlertsService.go(notifications)

    const updatedResult = await licenceMonitoringStationUnTouched.$query()

    expect(updatedResult).to.equal(licenceMonitoringStationUnTouched)
  })
})
