// Test framework dependencies

// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import CheckService from '../../../../app/services/licence-monitoring-station/setup/check.service.js'

describe('Licence Monitoring Station Setup - Check Service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      unit: 'Ml/d',
      label: 'LABEL',
      threshold: 100,
      licenceRef: 'LICENCE_REF',
      conditionId: 'no_condition',
      stopOrReduce: 'stop',
      reduceAtThreshold: null,
      conditionDisplayText: 'None',
      abstractionPeriodEndDay: '3',
      abstractionPeriodEndMonth: '4',
      abstractionPeriodStartDay: '1',
      abstractionPeriodStartMonth: '2'
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns the expected output', async () => {
      const result = await CheckService(session.id)

      expect(result).toEqual({
        abstractionPeriod: '1 February to 3 April',
        abstractionPeriodManuallyEntered: true,
        condition: 'None',
        licenceRef: 'LICENCE_REF',
        links: {
          threshold: `/system/licence-monitoring-station/setup/${session.id}/threshold-and-unit`,
          type: `/system/licence-monitoring-station/setup/${session.id}/stop-or-reduce`,
          licenceNumber: `/system/licence-monitoring-station/setup/${session.id}/licence-number`,
          licenceCondition: `/system/licence-monitoring-station/setup/${session.id}/full-condition`,
          abstractionPeriod: `/system/licence-monitoring-station/setup/${session.id}/abstraction-period`
        },
        monitoringStationLabel: 'LABEL',
        pageTitle: 'Check the restriction details',
        threshold: '100Ml/d',
        type: 'Stop'
      })
    })

    it('sets the "checkPageVisited" flag to "true"', async () => {
      await CheckService(session.id)

      expect(session.checkPageVisited).toBe(true)
      expect(session.$update).toHaveBeenCalled()
    })
  })
})
