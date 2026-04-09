'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

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

  beforeEach(async () => {
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

      expect(session).to.equal(session)
      expect(session.$update.called).to.be.true()
    })

    it('continues the journey', async () => {
      const result = await __MODULE_NAME__.go(session.id, payload)

      expect(result).to.equal({})
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await __MODULE_NAME__.go(session.id, payload)

      expect(result).to.equal({
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
