// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from '../../../../support/stubs/session.stub.js'
import YarStub from '../../../../support/stubs/yar.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitAccessService from '../../../../../app/services/users/internal/setup/submit-access.service.js'

describe('Users - Internal - Setup - Submit Access Service', () => {
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    sessionData = { access: 'enabled' }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called with a valid payload', () => {
    beforeEach(() => {
      payload = { access: 'disabled' }
    })

    it('saves the submitted value', async () => {
      await SubmitAccessService(session.id, payload, yarStub)

      expect(session).toEqual({
        ...session,
        access: 'disabled'
      })
      expect(session.$update).toHaveBeenCalled()
    })

    it('continues the journey', async () => {
      const result = await SubmitAccessService(session.id, payload, yarStub)

      expect(result).toEqual({
        redirectUrl: `/system/users/internal/setup/${session.id}/check`
      })
    })

    describe('on the check page', () => {
      describe('when the "session" and "payload" value', () => {
        describe('match', () => {
          beforeEach(() => {
            payload = { access: 'enabled' }
          })

          it('does not set a notification', async () => {
            await SubmitAccessService(session.id, payload, yarStub)

            expect(yarStub.flash).not.toHaveBeenCalled()
          })
        })

        describe('do not match', () => {
          beforeEach(() => {
            payload = { access: 'disabled' }
          })

          it('sets a notification', async () => {
            await SubmitAccessService(session.id, payload, yarStub)

            const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

            expect(flashType).toEqual('notification')
            expect(bannerMessage).toEqual({ titleText: 'Updated', text: 'Access updated' })
          })
        })
      })
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitAccessService(session.id, payload, yarStub)

      expect(result).toEqual({
        access: 'enabled',
        activeNavBar: 'users',
        backLink: {
          href: `/system/users/internal/setup/${session.id}/check`,
          text: 'Back'
        },
        error: {
          access: {
            text: 'Select access for the user'
          },
          errorList: [
            {
              href: '#access',
              text: 'Select access for the user'
            }
          ]
        },
        pageTitle: 'Select access for the user',
        pageTitleCaption: 'Internal'
      })
    })
  })
})
