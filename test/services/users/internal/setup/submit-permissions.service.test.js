'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModelStub = require('../../../../support/stubs/session.stub.js')
const YarStub = require('../../../../support/stubs/yar.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../../app/dal/fetch-session.dal.js')
const FetchUserDetailsDal = require('../../../../../app/dal/users/internal/fetch-user-details.dal.js')

// Thing under test
const SubmitPermissionsService = require('../../../../../app/services/users/internal/setup/submit-permissions.service.js')

describe('Users - Internal - Setup - Submit Permissions Service', () => {
  let auth
  let fetchSessionStub
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    auth = { credentials: { user: { id: 1 } } }

    sessionData = {}

    session = SessionModelStub.build(Sinon, sessionData)

    fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)

    const currentUserPermissions = 'billing_and_data'

    Sinon.stub(FetchUserDetailsDal, 'go').resolves({
      $permissions: () => {
        return { key: currentUserPermissions }
      }
    })

    yarStub = YarStub.build(Sinon)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called with a valid payload', () => {
    beforeEach(() => {
      payload = { permissions: 'basic' }
    })

    it('saves the submitted value', async () => {
      await SubmitPermissionsService.go(auth, session.id, payload, yarStub)

      expect(session).to.equal({
        ...session,
        permissions: 'basic'
      })
      expect(session.$update.called).to.be.true()
    })

    it('continues the journey', async () => {
      const result = await SubmitPermissionsService.go(auth, session.id, payload, yarStub)

      expect(result).to.equal({
        redirectUrl: `/system/users/internal/setup/${session.id}/check`
      })
    })

    describe('and the check page has', () => {
      describe('been visited', () => {
        beforeEach(() => {
          session = SessionModelStub.build(Sinon, {
            ...sessionData,
            checkPageVisited: true,
            permissions: 'basic'
          })

          fetchSessionStub.resolves(session)
        })

        describe('and the "session" and "payload" value', () => {
          describe('match', () => {
            beforeEach(() => {
              payload = { permissions: 'basic' }
            })

            it('does not set a notification', async () => {
              await SubmitPermissionsService.go(auth, session.id, payload, yarStub)

              expect(yarStub.flash.called).to.be.false()
            })
          })

          describe('do not match', () => {
            beforeEach(() => {
              payload = { permissions: 'super' }
            })

            it('sets a notification', async () => {
              await SubmitPermissionsService.go(auth, session.id, payload, yarStub)

              const [flashType, bannerMessage] = yarStub.flash.args[0]

              expect(flashType).to.equal('notification')
              expect(bannerMessage).to.equal({ titleText: 'Updated', text: 'Permissions updated' })
            })
          })
        })
      })

      describe('not been visited', () => {
        it('does not set a notification', async () => {
          await SubmitPermissionsService.go(auth, session.id, payload, yarStub)

          expect(yarStub.flash.called).to.be.false()
        })
      })
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitPermissionsService.go(auth, session.id, payload, yarStub)

      expect(result).to.equal({
        backLink: {
          href: `/system/users/internal/setup/${session.id}/email`,
          text: 'Back'
        },
        error: {
          permissions: {
            text: 'Select a permission'
          },
          errorList: [
            {
              href: '#permissions',
              text: 'Select a permission'
            }
          ]
        },
        pageTitle: 'Select permissions for the user',
        pageTitleCaption: 'Internal',
        permissions: undefined,
        showSuperPermission: false
      })
    })
  })
})
