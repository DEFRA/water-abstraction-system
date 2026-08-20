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
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    licenceMonitoringStations = AbstractionAlertSessionData.licenceMonitoringStations()

    payload = {}

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

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('and there are no licence monitoring stations removed', () => {
      it('returns a result that tells the controller to redirect to the next page', async () => {
        const result = await SubmitCheckLicenceMatchesService(payload, session.id, yarStub)

        expect(result).toEqual({ checkLicenceMatches: false })
      })

      it('saves the "licenceRefs" to the session', async () => {
        await SubmitCheckLicenceMatchesService(payload, session.id, yarStub)

        expect(session.licenceRefs).toEqual([
          licenceMonitoringStations.one.licence.licenceRef,
          licenceMonitoringStations.two.licence.licenceRef,
          licenceMonitoringStations.three.licence.licenceRef
        ])

        expect(session.$update).toHaveBeenCalled()
      })

      it('saves the "relevantLicenceMonitoringStations" to the session', async () => {
        await SubmitCheckLicenceMatchesService(payload, session.id, yarStub)

        expect(session.relevantLicenceMonitoringStations).toEqual([
          licenceMonitoringStations.one,
          licenceMonitoringStations.two,
          licenceMonitoringStations.three
        ])
      })
    })

    describe('and there are duplicate licence refs', () => {
      beforeEach(() => {
        sessionData.licenceMonitoringStations = [licenceMonitoringStations.one, licenceMonitoringStationDuplicate]

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the "licenceRefs" to the session with duplicates removed', async () => {
        await SubmitCheckLicenceMatchesService(payload, session.id, yarStub)

        expect(session.licenceRefs).toEqual([licenceMonitoringStations.one.licence.licenceRef])
      })

      it('saves the "relevantLicenceMonitoringStations" to the session', async () => {
        await SubmitCheckLicenceMatchesService(payload, session.id, yarStub)

        expect(session.relevantLicenceMonitoringStations).toEqual([
          licenceMonitoringStations.one,
          licenceMonitoringStationDuplicate
        ])
      })
    })

    describe('and there are licence monitoring stations removed', () => {
      beforeEach(() => {
        sessionData.removedThresholds = [licenceMonitoringStations.one.id, licenceMonitoringStations.two.id]

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the "licenceRefs" to the session without the removed thresholds', async () => {
        await SubmitCheckLicenceMatchesService(payload, session.id, yarStub)

        expect(session.licenceRefs).toEqual([licenceMonitoringStations.three.licence.licenceRef])
      })

      it('saves the "relevantLicenceMonitoringStations" to the session', async () => {
        await SubmitCheckLicenceMatchesService(payload, session.id, yarStub)

        expect(session.relevantLicenceMonitoringStations).toEqual([licenceMonitoringStations.three])
      })
    })

    describe('with the instruction to clear filters', () => {
      beforeEach(() => {
        payload = { clearFilters: 'reset' }
      })

      it('returns a result that tells the controller to redirect back to the page', async () => {
        const result = await SubmitCheckLicenceMatchesService(payload, session.id, yarStub)

        expect(result).toEqual({ checkLicenceMatches: true })
      })

      it('clears the "absPeriodFilter" object from the session', async () => {
        await SubmitCheckLicenceMatchesService(payload, session.id, yarStub)

        expect(yarStub.clear).toHaveBeenCalledWith('absPeriodFilter')
      })

      it('does not save the licence monitoring stations to the session', async () => {
        await SubmitCheckLicenceMatchesService(payload, session.id, yarStub)

        expect(session.$update).not.toHaveBeenCalled()
      })
    })

    describe('with the instruction to apply filters', () => {
      beforeEach(() => {
        payload = { absPeriod: '1-1-31-3', applyFilters: 'apply' }
      })

      it('returns a result that tells the controller to redirect back to the page', async () => {
        const result = await SubmitCheckLicenceMatchesService(payload, session.id, yarStub)

        expect(result).toEqual({ checkLicenceMatches: true })
      })

      it('saves the "absPeriodFilter" object in the session', async () => {
        await SubmitCheckLicenceMatchesService(payload, session.id, yarStub)

        expect(yarStub.set).toHaveBeenCalledWith('absPeriodFilter', { absPeriod: '1-1-31-3' })
      })

      it('does not save the licence monitoring stations to the session', async () => {
        await SubmitCheckLicenceMatchesService(payload, session.id, yarStub)

        expect(session.$update).not.toHaveBeenCalled()
      })

      describe('but no abstraction period has been selected', () => {
        beforeEach(() => {
          payload = { applyFilters: 'apply' }
        })

        it('saves a default "absPeriodFilter" object in the session', async () => {
          await SubmitCheckLicenceMatchesService(payload, session.id, yarStub)

          expect(yarStub.set).toHaveBeenCalledWith('absPeriodFilter', { absPeriod: null })
        })
      })
    })
  })
})
