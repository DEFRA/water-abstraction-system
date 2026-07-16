// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import * as AbstractionAlertSessionData from '../../../../support/fixtures/abstraction-alert-session-data.fixture.js'
import SessionModelStub from '../../../../support/stubs/session.stub.js'
import YarStub from '../../../../support/stubs/yar.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../../app/dal/fetch-session.dal.js'

// Thing under test
import ProcessRemoveThresholdService from '../../../../../app/services/notices/setup/abstraction-alerts/process-remove-threshold.service.js'

describe('Notices - Setup - Abstraction Alerts -Process Remove Threshold service', () => {
  let licenceMonitoringStations
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    licenceMonitoringStations = AbstractionAlertSessionData.licenceMonitoringStations()

    sessionData = AbstractionAlertSessionData.get(licenceMonitoringStations)

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('and there are no thresholds currently removed', () => {
      it('saves the "licenceMonitoringStationId" to the session to be excluded from the list', async () => {
        await ProcessRemoveThresholdService(session.id, licenceMonitoringStations.one.id, yarStub)

        expect(session.removedThresholds).toEqual([licenceMonitoringStations.one.id])
        expect(session.$update).toHaveBeenCalled()
      })
    })

    describe('and there are existing "removedThresholds"', () => {
      beforeEach(() => {
        sessionData.removedThresholds = [licenceMonitoringStations.one.id]

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the "licenceMonitoringStationId" to the session with the existing "removedThresholds"', async () => {
        await ProcessRemoveThresholdService(session.id, licenceMonitoringStations.one.id, yarStub)

        expect(session.removedThresholds).toEqual([licenceMonitoringStations.one.id, licenceMonitoringStations.one.id])
      })
    })

    describe('and there is a notification', () => {
      beforeEach(() => {
        sessionData.removedThresholds = [licenceMonitoringStations.one.id]

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })
      it('sets a flash message', async () => {
        await ProcessRemoveThresholdService(session.id, licenceMonitoringStations.one.id, yarStub)

        // Check we add the flash message
        const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

        expect(flashType).toEqual('notification')
        expect(bannerMessage).toEqual({
          text: `Removed ${licenceMonitoringStations.one.licence.licenceRef} Reduce 1000m`,
          titleText: 'Updated'
        })
      })
    })
  })
})
