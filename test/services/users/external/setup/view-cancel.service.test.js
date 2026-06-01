'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModelStub = require('../../../../support/stubs/session.stub.js')
const { generateUUID } = require('../../../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../../../support/helpers/licence.helper.js')

// Things we need to stub
const FetchSessionDal = require('../../../../../app/dal/fetch-session.dal.js')

// Thing under test
const ViewCancelService = require('../../../../../app/services/users/external/setup/view-cancel.service.js')

describe('Users - External - Setup - View Cancel Service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      activeNavBar: 'users',
      allLicences: true,
      id: generateUUID(),
      licences: [
        {
          id: generateUUID(),
          licenceRef: generateLicenceRef(),
          licenceVersions: [
            {
              id: generateUUID(),
              issueDate: null,
              licenceId: generateUUID(),
              startDate: new Date('2022-04-01'),
              status: 'current',
              company: {
                id: generateUUID(),
                name: 'ACME Farms Ltd',
                type: 'organisation'
              }
            }
          ]
        }
      ],
      selectedLicences: [],
      user: {
        id: generateUUID(),
        licenceEntityId: generateUUID(),
        username: 'jon.lee@example.co.uk'
      }
    }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewCancelService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'users',
        backLink: {
          href: `/system/users/external/setup/${session.id}/check`,
          text: 'Back'
        },
        licences: ['All licences'],
        pageTitle: 'You are about to cancel unregistering these licences',
        pageTitleCaption: session.user.username
      })
    })
  })
})
