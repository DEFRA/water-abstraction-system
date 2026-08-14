// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'
import YarStub from 'water-abstraction-engine/test/stubs/yar.stub.js'
import AbstractionAlertSessionData from '../../../../support/fixtures/abstraction-alert-session-data.fixture.js'

// Things we need to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

// Thing under test
import ProcessRemoveFilteredThresholdsService from '../../../../../src/services/notices/setup/abstraction-alerts/process-remove-filtered-thresholds.service.js'

describe('Notices - Setup - Abstraction Alerts - Process Remove Filtered Thresholds service', () => {
  let absPeriodFilter
  let licenceMonitoringStations
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    absPeriodFilter = '1-1-31-3'

    licenceMonitoringStations = AbstractionAlertSessionData.licenceMonitoringStations()

    sessionData = {
      ...AbstractionAlertSessionData.get(licenceMonitoringStations),
      alertThresholds: [
        licenceMonitoringStations.one.thresholdGroup,
        licenceMonitoringStations.two.thresholdGroup,
        licenceMonitoringStations.three.thresholdGroup
      ],
      alertType: 'warning'
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('and there are no thresholds currently removed', () => {
      it('saves the matching "licenceMonitoringStationIds" to the session to be excluded from the list', async () => {
        await ProcessRemoveFilteredThresholdsService(absPeriodFilter, session.id, yarStub)

        expect(session.removedThresholds).toEqual([
          licenceMonitoringStations.two.id,
          licenceMonitoringStations.three.id
        ])
        expect(session.$update).toHaveBeenCalled()
      })
    })

    describe('and there are existing "removedThresholds"', () => {
      beforeEach(() => {
        sessionData.removedThresholds = [licenceMonitoringStations.one.id]

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the matching "licenceMonitoringStationIds" to the session with the existing "removedThresholds"', async () => {
        await ProcessRemoveFilteredThresholdsService(absPeriodFilter, session.id, yarStub)

        expect(session.removedThresholds).toEqual([
          licenceMonitoringStations.one.id,
          licenceMonitoringStations.two.id,
          licenceMonitoringStations.three.id
        ])
      })
    })

    describe('and there is a notification', () => {
      describe('and multiple thresholds match the filter', () => {
        it('sets a flash message with the number of alerts in the plural', async () => {
          await ProcessRemoveFilteredThresholdsService(absPeriodFilter, session.id, yarStub)

          // Check we add the flash message
          const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

          expect(flashType).toEqual('notification')
          expect(bannerMessage).toEqual({
            text: '2 alerts removed from the send list.',
            titleText: 'Updated'
          })
        })
      })

      describe('and only one threshold matches the filter', () => {
        beforeEach(() => {
          absPeriodFilter = '1-2-1-1'
        })

        it('sets a flash message with the number of alerts in the singular', async () => {
          await ProcessRemoveFilteredThresholdsService(absPeriodFilter, session.id, yarStub)

          // Check we add the flash message
          const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

          expect(flashType).toEqual('notification')
          expect(bannerMessage).toEqual({
            text: '1 alert removed from the send list.',
            titleText: 'Updated'
          })
        })
      })
    })
  })
})
