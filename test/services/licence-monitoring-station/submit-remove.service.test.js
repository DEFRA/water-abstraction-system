'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const LicenceMonitoringStationHelper = require('../../support/helpers/licence-monitoring-station.helper.js')
const YarStub = require('../../support/stubs/yar.stub.js')

// Thing under test
const SubmitRemoveService = require('../../../app/services/licence-monitoring-station/submit-remove.service.js')

describe('Licence Monitoring Station - Submit Remove service', () => {
  const licenceRef = '99/999/9999'

  let licenceMonitoringStation
  let yarStub

  beforeEach(async () => {
    licenceMonitoringStation = await LicenceMonitoringStationHelper.add()

    yarStub = YarStub.build(Sinon)
  })

  describe('when a user submits the licence monitoring station to be removed', () => {
    it('adds the current date to the "deletedAt" field of the licence monitoring station record', async () => {
      await SubmitRemoveService(licenceMonitoringStation.id, licenceRef, yarStub)

      const refreshedSession = await licenceMonitoringStation.$query()

      expect(refreshedSession.deletedAt).not.toBeNull()
    })

    it('sets the notification message title to "Updated" and the text to "Tag removed for 99/999/9999" ', async () => {
      await SubmitRemoveService(licenceMonitoringStation.id, licenceRef, yarStub)

      const [flashType, notification] = yarStub.flash.args[0]

      expect(flashType).toEqual('notification')
      expect(notification).toEqual({ titleText: 'Updated', text: 'Tag removed for 99/999/9999' })
    })
  })
})
