// Test framework dependencies

// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import * as DeleteSessionDal from '../../../../app/dal/delete-session.dal.js'
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitCancelService from '../../../../app/services/notices/setup/submit-cancel.service.js'

describe('Notices - Setup - Submit Cancel service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = { licenceRef: '01/111', referenceCode: 'RNIV-1234' }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    vi.spyOn(DeleteSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('clears the session', async () => {
      await SubmitCancelService(session.id)

      expect(DeleteSessionDal.go).toHaveBeenCalledWith(session.id)
    })

    describe('when the journey is for a return', () => {
      it('returns the redirect url', async () => {
        const result = await SubmitCancelService(session.id)

        expect(result).toEqual('/system/notices')
      })
    })

    describe('when the journey is for "alerts"', () => {
      beforeEach(() => {
        sessionData = {
          alertType: 'stop',
          journey: 'alerts',
          monitoringStationId: '123',
          referenceCode: 'WAA-1234'
        }
        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('returns the redirect url', async () => {
        const result = await SubmitCancelService(session.id)

        expect(result).toEqual('/system/monitoring-stations/123')
      })
    })
  })
})
