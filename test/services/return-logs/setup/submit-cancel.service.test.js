// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'

// Things we need to stub
import * as DeleteSessionDal from 'water-abstraction-engine/dal/delete-session.dal.js'

// Thing under test
import SubmitCancelService from '../../../../src/services/return-logs/setup/submit-cancel.service.js'

describe('Return Logs Setup - Submit Cancel service', () => {
  let session

  beforeEach(() => {
    session = SessionModelStub({})

    vi.spyOn(DeleteSessionDal, 'default').mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when a user submits the return submission to be cancelled', () => {
    it('deletes the session data', async () => {
      await SubmitCancelService(session.id)

      expect(DeleteSessionDal.default).toHaveBeenCalledWith(session.id)
    })
  })
})
