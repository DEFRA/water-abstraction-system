'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const SessionModelStub = require('../../../../support/stubs/session.stub.js')
const UserSessionsFixture = require('../../../../support/fixtures/user-sessions.fixture.js')

// Things we need to stub
const FetchSessionDal = require('../../../../../app/dal/fetch-session.dal.js')

// Thing under test
const ViewLicencesService = require('../../../../../app/services/users/external/setup/view-licences.service.js')

describe('Users - External - Setup - View Licences Service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = UserSessionsFixture.unregistrationSession()

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewLicencesService(session.id)

      expect(result).toEqual({
        activeNavBar: 'users',
        backLink: {
          href: `/system/users/external/${sessionData.user.id}/licences`,
          text: 'Back'
        },
        checkBoxItems: [
          {
            checked: false,
            hint: { text: session.licences[0].licenceVersions[0].company.name },
            text: session.licences[0].licenceRef,
            value: session.licences[0].id
          },
          {
            checked: false,
            hint: { text: session.licences[1].licenceVersions[0].company.name },
            text: session.licences[1].licenceRef,
            value: session.licences[1].id
          },
          {
            divider: 'or'
          },
          {
            behaviour: 'exclusive',
            checked: false,
            text: 'All licences',
            value: 'all'
          }
        ],
        pageTitle: 'Select licences to unregister',
        pageTitleCaption: sessionData.user.username,
        showHint: true
      })
    })
  })
})
