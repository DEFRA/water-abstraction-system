'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const SessionModelStub = require('../../../../support/stubs/session.stub.js')
const YarStub = require('../../../../support/stubs/yar.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitAccessService = require('../../../../../app/services/users/internal/setup/submit-access.service.js')

describe('Users - Internal - Setup - Submit Access Service', () => {
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    sessionData = { access: 'enabled' }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)

    yarStub = YarStub.build(Sinon)
  })

  afterEach(() => {
    Sinon.restore()
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
      expect(session.$update.called).toBe(true)
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

            expect(yarStub.flash.called).toBe(false)
          })
        })

        describe('do not match', () => {
          beforeEach(() => {
            payload = { access: 'disabled' }
          })

          it('sets a notification', async () => {
            await SubmitAccessService(session.id, payload, yarStub)

            const [flashType, bannerMessage] = yarStub.flash.args[0]

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
