'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const SessionModelStub = require('__STUBS_SESSION_PATH__')

// Things we need to stub
const FetchSessionDal = require('__FETCH_SESSION_DAL_TEST_PATH__')

// Thing under test
const __MODULE_NAME__ = require('__REQUIRE_PATH__')

describe('__DESCRIBE_LABEL__', () => {
  let payload
  let session
  let sessionData

  beforeEach(() => {
    payload = { placeholder: 'change me' }
    sessionData = {}

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('saves the submitted value', async () => {
      await __MODULE_NAME__.go(session.id, payload)

      expect(session).toEqual(session)
      expect(session.$update.called).toBe(true)
    })

    it('continues the journey', async () => {
      const result = await __MODULE_NAME__.go(session.id, payload)

      expect(result).toEqual({})
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await __MODULE_NAME__.go(session.id, payload)

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
