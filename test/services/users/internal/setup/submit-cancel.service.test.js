// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from '../../../../support/stubs/session.stub.js'

// Things we need to stub
import * as DeleteSessionDal from '../../../../../app/dal/delete-session.dal.js'

// Thing under test
import SubmitCancelService from '../../../../../app/services/users/internal/setup/submit-cancel.service.js'

describe('Users - Internal - Setup - Submit Cancel service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      email: 'bob.bobbles@environment-agency.gov.uk',
      permission: 'billing_and_data'
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(DeleteSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('clears the session', async () => {
      await SubmitCancelService(session.id)

      expect(DeleteSessionDal.default).toHaveBeenCalledWith(session.id)
    })

    it('returns the redirect url', async () => {
      const result = await SubmitCancelService(session.id)

      expect(result).toEqual({
        redirectUrl: '/system/users'
      })
    })
  })
})
