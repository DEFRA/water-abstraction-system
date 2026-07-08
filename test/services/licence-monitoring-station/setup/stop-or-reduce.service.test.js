// Test framework dependencies

// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import StopOrReduceService from '../../../../app/services/licence-monitoring-station/setup/stop-or-reduce.service.js'

describe('Licence Monitoring Station Setup - Stop Or Reduce service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      monitoringStationId: 'e1c44f9b-51c2-4aee-a518-5509d6f05869',
      label: 'Monitoring Station Label'
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await StopOrReduceService(session.id)

      expect(result.sessionId).toEqual(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await StopOrReduceService(session.id)

      expect(result).toMatchObject({
        backLink: `/system/licence-monitoring-station/setup/${session.id}/threshold-and-unit`,
        monitoringStationLabel: 'Monitoring Station Label',
        pageTitle: 'Does the licence holder need to stop or reduce at this threshold?',
        stopOrReduce: null,
        reduceAtThreshold: null
      })
    })
  })
})
