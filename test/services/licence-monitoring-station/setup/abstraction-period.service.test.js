// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import AbstractionPeriodService from '../../../../app/services/licence-monitoring-station/setup/abstraction-period.service.js'

describe('Licence Monitoring Station Setup - Abstraction Period Service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      label: 'FRENCHAY',
      licenceRef: '01/115',
      abstractionPeriodStartDay: '1',
      abstractionPeriodStartMonth: '2',
      abstractionPeriodEndDay: '3',
      abstractionPeriodEndMonth: '4'
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await AbstractionPeriodService(session.id)

      expect(result).toEqual({
        abstractionPeriodStartDay: '1',
        abstractionPeriodEndDay: '3',
        abstractionPeriodStartMonth: '2',
        abstractionPeriodEndMonth: '4',
        backLink: {
          href: `/system/licence-monitoring-station/setup/${session.id}/full-condition`,
          text: 'Back'
        },
        monitoringStationLabel: 'FRENCHAY',
        pageTitle: 'Enter an abstraction period for licence 01/115'
      })
    })
  })
})
