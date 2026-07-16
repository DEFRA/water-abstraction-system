// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from '__STUBS_SESSION_PATH__'

// Things we need to stub
import FetchSessionDal from '__FETCH_SESSION_DAL_TEST_PATH__'

// Thing under test
import __MODULE_NAME__ from '__REQUIRE_PATH__'

describe('__DESCRIBE_LABEL__', () => {
  let payload
  let session
  let sessionData

  beforeEach(() => {
    payload = { placeholder: 'change me' }
    sessionData = {}

    session = SessionModelStub.build(sessionData)

    vi.mock('__FETCH_SESSION_DAL_TEST_PATH__')
    FetchSessionDal.mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('saves the submitted value', async () => {
      await __MODULE_NAME__(session.id, payload)

      expect(session).toEqual(session)
      expect(session.$update.called).toBe(true)
    })

    it('continues the journey', async () => {
      const result = await __MODULE_NAME__(session.id, payload)

      expect(result).toEqual({})
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await __MODULE_NAME__(session.id, payload)

      expect(result).toEqual({
        backLink: {
          href: '',
          text: 'Back'
        },
        error: {
          errorList: [
            {
              href: '#placeholder',
              text: '"placeholder" is required'
            }
          ],
          placeholder: {
            text: '"placeholder" is required'
          }
        },
        pageTitle: ''
      })
    })
  })
})
