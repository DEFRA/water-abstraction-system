// Test framework dependencies

// Test helpers
import * as AbstractionAlertSessionData from '../../../../support/fixtures/abstraction-alert-session-data.fixture.js'
import SessionModelStub from '../../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitCheckLicenceMatchesService from '../../../../../app/services/notices/setup/abstraction-alerts/submit-check-licence-matches.service.js'

describe('Notices - Setup - Abstraction Alerts - Submit Check Licence Matches service', () => {
  let licenceMonitoringStationDuplicate
  let licenceMonitoringStations
  let session
  let sessionData

  beforeEach(() => {
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
        await SubmitCheckLicenceMatchesService(session.id)

        expect(session.licenceRefs).toEqual([
          licenceMonitoringStations.one.licence.licenceRef,
          licenceMonitoringStations.two.licence.licenceRef,
          licenceMonitoringStations.three.licence.licenceRef
        ])

        expect(session.$update).toHaveBeenCalled()
      })

      it('saves the "relevantLicenceMonitoringStations" to the session', async () => {
        await SubmitCheckLicenceMatchesService(session.id)

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
        await SubmitCheckLicenceMatchesService(session.id)

        expect(session.licenceRefs).toEqual([licenceMonitoringStations.one.licence.licenceRef])
      })

      it('saves the "relevantLicenceMonitoringStations" to the session', async () => {
        await SubmitCheckLicenceMatchesService(session.id)

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
        await SubmitCheckLicenceMatchesService(session.id)

        expect(session.licenceRefs).toEqual([licenceMonitoringStations.three.licence.licenceRef])
      })

      it('saves the "relevantLicenceMonitoringStations" to the session', async () => {
        await SubmitCheckLicenceMatchesService(session.id)

        expect(session.relevantLicenceMonitoringStations).toEqual([licenceMonitoringStations.three])
      })
    })
  })
})
