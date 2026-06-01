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
const DeleteSessionDal = require('../../../../../app/dal/delete-session.dal.js')
const FetchSessionDal = require('../../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitCancelService = require('../../../../../app/services/users/external/setup/submit-cancel.service.js')

describe('Users - External - Setup - Submit Cancel service', () => {
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

    Sinon.stub(DeleteSessionDal, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('clears the session', async () => {
      await SubmitCancelService.go(session.id)

      expect(DeleteSessionDal.go.calledWith(session.id)).to.be.true()
    })

    it('returns the redirect url', async () => {
      const result = await SubmitCancelService.go(session.id)

      expect(result).to.equal({
        redirectUrl: `/system/users/external/${session.user.id}/licences?back=${session.activeNavBar}`
      })
    })
  })
})
