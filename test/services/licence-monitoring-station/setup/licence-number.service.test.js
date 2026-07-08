// Test framework dependencies

// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import LicenceNumberService from '../../../../app/services/licence-monitoring-station/setup/licence-number.service.js'

describe('Licence Monitoring Station Setup - Licence Number Service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      label: 'MONITORING_STATION_LABEL',
      licenceRef: 'LICENCE_REF',
      checkPageVisited: false
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await LicenceNumberService(session.id)

      expect(result).toEqual({
        backLink: `/system/licence-monitoring-station/setup/${session.id}/stop-or-reduce`,
        licenceRef: 'LICENCE_REF',
        monitoringStationLabel: 'MONITORING_STATION_LABEL',
        pageTitle: 'Enter the licence number this threshold applies to'
      })
    })
  })
})
