// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from '../../../../support/stubs/session.stub.js'

import { generateUUID } from '../../../../support/generators.js'

// Things we need to stub
import * as DeleteSessionDal from '../../../../../app/dal/delete-session.dal.js'
import * as FetchSessionDal from '../../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitCancelAlertsService from '../../../../../app/services/notices/setup/abstraction-alerts/submit-cancel-alerts.service.js'

describe('Notices - Setup - Abstraction Alerts - Submit Cancel Alerts service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = { monitoringStationId: generateUUID() }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
    vi.spyOn(DeleteSessionDal, 'default').mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns the monitoring station id', async () => {
      const result = await SubmitCancelAlertsService(session.id)

      expect(result).toEqual({ monitoringStationId: sessionData.monitoringStationId })
    })

    it('clears the session', async () => {
      await SubmitCancelAlertsService(session.id)

      expect(DeleteSessionDal.default).toHaveBeenCalledWith(session.id)
    })
  })
})
