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
const FetchUserDetailsDal = require('../../../../../app/dal/users/internal/fetch-user-details.dal.js')

// Thing under test
const ViewPermissionsService = require('../../../../../app/services/users/internal/setup/view-permissions.service.js')

describe('Users - Internal - Setup - View Permissions Service', () => {
  let auth
  let currentUserPermissions
  let session
  let sessionData

  beforeEach(() => {
    auth = { credentials: { user: { id: 1 } } }

    sessionData = {}

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)

    currentUserPermissions = 'super'

    Sinon.stub(FetchUserDetailsDal, 'go').resolves({
      $permissions: () => {
        return { key: currentUserPermissions }
      }
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewPermissionsService.go(auth, session.id)

      expect(result).to.equal({
        backLink: {
          href: `/system/users/internal/setup/${session.id}/user-email`,
          text: 'Back'
        },
        isSuper: true,
        pageTitle: 'Select permissions for the user',
        pageTitleCaption: 'Internal',
        permissions: undefined
      })
    })
  })
})
