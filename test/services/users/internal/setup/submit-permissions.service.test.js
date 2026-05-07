'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModelStub = require('../../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitPermissionsService = require('../../../../../app/services/users/internal/setup/submit-permissions.service.js')

describe('Users - Internal - Setup - Permissions Service', () => {
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
      await SubmitPermissionsService.go(session.id, payload)

      expect(session).to.equal(session)
      expect(session.$update.called).to.be.true()
    })

    it('continues the journey', async () => {
      const result = await SubmitPermissionsService.go(session.id, payload)

      expect(result).to.equal({})
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitPermissionsService.go(session.id, payload)

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
