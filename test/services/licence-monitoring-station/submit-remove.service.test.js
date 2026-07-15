// Test helpers
import * as LicenceMonitoringStationHelper from '../../support/helpers/licence-monitoring-station.helper.js'
import YarStub from '../../support/stubs/yar.stub.js'

// Thing under test
import SubmitRemoveService from '../../../app/services/licence-monitoring-station/submit-remove.service.js'

describe('Licence Monitoring Station - Submit Remove service', () => {
  const licenceRef = '99/999/9999'

  let licenceMonitoringStation
  let yarStub

  beforeEach(async () => {
    licenceMonitoringStation = await LicenceMonitoringStationHelper.add()

    yarStub = YarStub()
  })

  describe('when a user submits the licence monitoring station to be removed', () => {
    it('adds the current date to the "deletedAt" field of the licence monitoring station record', async () => {
      await SubmitRemoveService(licenceMonitoringStation.id, licenceRef, yarStub)

      const refreshedSession = await licenceMonitoringStation.$query()

      expect(refreshedSession.deletedAt).not.toBeNull()
    })

    it('sets the notification message title to "Updated" and the text to "Tag removed for 99/999/9999" ', async () => {
      await SubmitRemoveService(licenceMonitoringStation.id, licenceRef, yarStub)

      const [flashType, notification] = yarStub.flash.mock.calls[0]

      expect(flashType).toEqual('notification')
      expect(notification).toEqual({ titleText: 'Updated', text: 'Tag removed for 99/999/9999' })
    })
  })
})
