// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'

// Things to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

// Thing under test
import CheckService from '../../../../src/services/licence-monitoring-station/setup/check.service.js'

describe('Licence Monitoring Station Setup - Check Service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      abstractionPeriodEndDay: '3',
      abstractionPeriodEndMonth: '4',
      abstractionPeriodStartDay: '1',
      abstractionPeriodStartMonth: '2',
      conditionDisplayText: 'None',
      conditionId: 'no_condition',
      label: 'LABEL',
      licenceRef: 'LICENCE_REF',
      reduceAtThreshold: null,
      stopOrReduce: 'stop',
      threshold: 100,
      unit: 'Ml/d'
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
          abstractionPeriod: `/system/licence-monitoring-station/setup/${session.id}/abstraction-period`,
          licenceCondition: `/system/licence-monitoring-station/setup/${session.id}/full-condition`,
          licenceNumber: `/system/licence-monitoring-station/setup/${session.id}/licence-number`,
          threshold: `/system/licence-monitoring-station/setup/${session.id}/threshold-and-unit`,
          type: `/system/licence-monitoring-station/setup/${session.id}/stop-or-reduce`
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
