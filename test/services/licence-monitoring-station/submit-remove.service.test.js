// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import YarStub from 'water-abstraction-engine/test/stubs/yar.stub.js'
import { generateLicenceRef, generateUUID } from 'water-abstraction-engine/test/generators.js'

// Things we need to stub
import * as DeleteLicenceMonitoringStationDal from '../../../src/dal/licence-monitoring-station/delete-licence-monitoring-station.dal.js'

// Thing under test
import SubmitRemoveService from '../../../src/services/licence-monitoring-station/submit-remove.service.js'

describe('Licence Monitoring Station - Submit Remove service', () => {
  let deleteLicenceMonitoringStationDalStub
  let licenceMonitoringStationId
  let licenceRef
  let yarStub

  beforeEach(() => {
    licenceMonitoringStationId = generateUUID()
    licenceRef = generateLicenceRef()

    deleteLicenceMonitoringStationDalStub = vi.spyOn(DeleteLicenceMonitoringStationDal, 'default').mockResolvedValue()

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when a user submits the licence monitoring station to be removed', () => {
    it('calls the "DeleteLicenceMonitoringStationDal" to soft delete the licence monitoring station', async () => {
      await SubmitRemoveService(licenceMonitoringStationId, licenceRef, yarStub)

      expect(deleteLicenceMonitoringStationDalStub).toHaveBeenCalledExactlyOnceWith(licenceMonitoringStationId)
    })

    it('sets the notification message title to "Updated" and the text to "Tag removed for [licence ref]"', async () => {
      await SubmitRemoveService(licenceMonitoringStationId, licenceRef, yarStub)

      const [flashType, notification] = yarStub.flash.mock.calls[0]

      expect(flashType).toEqual('notification')
      expect(notification).toEqual({ text: `Tag removed for ${licenceRef}`, titleText: 'Updated' })
    })
  })
})
