'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceMonitoringStationHelper = require('../../support/helpers/licence-monitoring-station.helper.js')

// Thing under test
const SubmitRemoveService = require('../../../app/services/licence-monitoring-station/submit-remove.service.js')

describe('Licence Monitoring Station - Submit Remove service', () => {
  const licenceRef = '99/999/9999'

  let licenceMonitoringStation
  let yarStub

  beforeEach(async () => {
    licenceMonitoringStation = await LicenceMonitoringStationHelper.add()

    yarStub = { flash: Sinon.stub() }
  })

  describe('when a user submits the licence monitoring station to be removed', () => {
    it('adds the current date to the "deletedAt" field of the licence monitoring station record', async () => {
      await SubmitRemoveService.go(licenceMonitoringStation.id, licenceRef, yarStub)

      const refreshedSession = await licenceMonitoringStation.$query()

      expect(refreshedSession.deletedAt).to.not.be.null()
    })

    it('sets the notification message title to "Updated" and the text to "Tag removed for 99/999/9999" ', async () => {
      await SubmitRemoveService.go(licenceMonitoringStation.id, licenceRef, yarStub)

      const [flashType, notification] = yarStub.flash.args[0]

      expect(flashType).to.equal('notification')
      expect(notification).to.equal({ titleText: 'Updated', text: 'Tag removed for 99/999/9999' })
    })
  })
})
