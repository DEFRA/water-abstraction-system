// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'

import YarStub from 'water-abstraction-engine/test/stubs/yar.stub.js'
import AbstractionAlertSessionData from '../../../../support/fixtures/abstraction-alert-session-data.fixture.js'

// Things we need to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

// Thing under test
import SubmitCheckLicenceMatchesService from '../../../../../src/services/notices/setup/abstraction-alerts/submit-check-licence-matches.service.js'

describe('Notices - Setup - Abstraction Alerts - Submit Check Licence Matches service', () => {
  let licenceMonitoringStationDuplicate
  let licenceMonitoringStations
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    yarStub = YarStub()

    licenceMonitoringStations = AbstractionAlertSessionData.licenceMonitoringStations()

    const abstractionAlertSessionData = AbstractionAlertSessionData.get(licenceMonitoringStations)

    // A licence monitoring station can have the same licence as another. When this is the case we need to check we
    // handle duplicate licence refs and that we do no strip / remove them unexpectedly
    licenceMonitoringStationDuplicate = licenceMonitoringStations.one

    sessionData = {
      ...abstractionAlertSessionData,
      alertThresholds: [
        licenceMonitoringStations.one.thresholdGroup,
        licenceMonitoringStations.two.thresholdGroup,
        licenceMonitoringStations.three.thresholdGroup
      ]
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('and there are no licence monitoring stations removed', () => {
      it('saves the "licenceRefs" to the session', async () => {
        await SubmitCheckLicenceMatchesService(session.id, yarStub)

        expect(session.licenceRefs).toEqual([
          licenceMonitoringStations.one.licence.licenceRef,
          licenceMonitoringStations.two.licence.licenceRef,
          licenceMonitoringStations.three.licence.licenceRef
        ])

        expect(session.$update).toHaveBeenCalled()
      })

      it('saves the "relevantLicenceMonitoringStations" to the session', async () => {
        await SubmitCheckLicenceMatchesService(session.id, yarStub)

        expect(session.relevantLicenceMonitoringStations).toEqual([
          licenceMonitoringStations.one,
          licenceMonitoringStations.two,
          licenceMonitoringStations.three
        ])
      })

      it('looks for the abstraction period filter saved against the session', async () => {
        await SubmitCheckLicenceMatchesService(session.id, yarStub)

        expect(yarStub.get).toHaveBeenCalledWith(`checkLicenceMatchesFilter-${session.id}`)
      })
    })

    describe('and there are duplicate licence refs', () => {
      beforeEach(() => {
        sessionData.licenceMonitoringStations = [licenceMonitoringStations.one, licenceMonitoringStationDuplicate]

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the "licenceRefs" to the session with duplicates removed', async () => {
        await SubmitCheckLicenceMatchesService(session.id, yarStub)

        expect(session.licenceRefs).toEqual([licenceMonitoringStations.one.licence.licenceRef])
      })

      it('saves the "relevantLicenceMonitoringStations" to the session', async () => {
        await SubmitCheckLicenceMatchesService(session.id, yarStub)

        expect(session.relevantLicenceMonitoringStations).toEqual([
          licenceMonitoringStations.one,
          licenceMonitoringStationDuplicate
        ])
      })
    })

    describe('and there are no licence monitoring stations removed', () => {
      beforeEach(() => {
        sessionData.removedThresholds = [licenceMonitoringStations.one.id, licenceMonitoringStations.two.id]

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the "licenceRefs" to the session without the removed thresholds', async () => {
        await SubmitCheckLicenceMatchesService(session.id, yarStub)

        expect(session.licenceRefs).toEqual([licenceMonitoringStations.three.licence.licenceRef])
      })

      it('saves the "relevantLicenceMonitoringStations" to the session', async () => {
        await SubmitCheckLicenceMatchesService(session.id, yarStub)

        expect(session.relevantLicenceMonitoringStations).toEqual([licenceMonitoringStations.three])
      })
    })

    describe('and an abstraction period filter has been applied', () => {
      describe('but no periods were selected', () => {
        beforeEach(() => {
          yarStub.get.mockReturnValue({ periods: [] })
        })

        it('saves all the "licenceRefs" to the session', async () => {
          await SubmitCheckLicenceMatchesService(session.id, yarStub)

          expect(session.licenceRefs).toEqual([
            licenceMonitoringStations.one.licence.licenceRef,
            licenceMonitoringStations.two.licence.licenceRef,
            licenceMonitoringStations.three.licence.licenceRef
          ])
        })

        it('saves all the "relevantLicenceMonitoringStations" to the session', async () => {
          await SubmitCheckLicenceMatchesService(session.id, yarStub)

          expect(session.relevantLicenceMonitoringStations).toEqual([
            licenceMonitoringStations.one,
            licenceMonitoringStations.two,
            licenceMonitoringStations.three
          ])
        })
      })

      describe('and a period matching more than one licence monitoring station was selected', () => {
        beforeEach(() => {
          yarStub.get.mockReturnValue({ periods: ['1-1-31-3'] })
        })

        it('saves only the matching "licenceRefs" to the session', async () => {
          await SubmitCheckLicenceMatchesService(session.id, yarStub)

          expect(session.licenceRefs).toEqual([
            licenceMonitoringStations.two.licence.licenceRef,
            licenceMonitoringStations.three.licence.licenceRef
          ])
        })

        it('saves only the matching "relevantLicenceMonitoringStations" to the session', async () => {
          await SubmitCheckLicenceMatchesService(session.id, yarStub)

          expect(session.relevantLicenceMonitoringStations).toEqual([
            licenceMonitoringStations.two,
            licenceMonitoringStations.three
          ])
        })
      })

      describe('and multiple periods were selected', () => {
        beforeEach(() => {
          yarStub.get.mockReturnValue({ periods: ['1-2-1-1', '1-1-31-3'] })
        })

        it('saves the "licenceRefs" matching any of the selected periods to the session', async () => {
          await SubmitCheckLicenceMatchesService(session.id, yarStub)

          expect(session.licenceRefs).toEqual([
            licenceMonitoringStations.one.licence.licenceRef,
            licenceMonitoringStations.two.licence.licenceRef,
            licenceMonitoringStations.three.licence.licenceRef
          ])
        })

        it('saves the "relevantLicenceMonitoringStations" matching any of the selected periods to the session', async () => {
          await SubmitCheckLicenceMatchesService(session.id, yarStub)

          expect(session.relevantLicenceMonitoringStations).toEqual([
            licenceMonitoringStations.one,
            licenceMonitoringStations.two,
            licenceMonitoringStations.three
          ])
        })
      })

      describe('and a threshold has also been removed', () => {
        beforeEach(() => {
          sessionData.removedThresholds = [licenceMonitoringStations.two.id]

          session = SessionModelStub(sessionData)

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

          yarStub.get.mockReturnValue({ periods: ['1-1-31-3'] })
        })

        it('saves only the "licenceRefs" left after both are applied to the session', async () => {
          await SubmitCheckLicenceMatchesService(session.id, yarStub)

          expect(session.licenceRefs).toEqual([licenceMonitoringStations.three.licence.licenceRef])
        })

        it('saves only the "relevantLicenceMonitoringStations" left after both are applied to the session', async () => {
          await SubmitCheckLicenceMatchesService(session.id, yarStub)

          expect(session.relevantLicenceMonitoringStations).toEqual([licenceMonitoringStations.three])
        })
      })
    })
  })
})
