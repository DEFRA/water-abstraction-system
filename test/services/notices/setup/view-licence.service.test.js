'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const ViewLicenceService = require('../../../../app/services/notices/setup/view-licence.service.js')

describe('Notices - Setup - View Licence service', () => {
  let licenceRef
  let session
  let sessionData

  beforeEach(() => {
    licenceRef = generateLicenceRef()

    sessionData = { licenceRef }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewLicenceService(session.id)

      expect(result).toEqual({
        activeNavBar: 'notices',
        backLink: {
          href: `/system/notices/setup/${session.id}/notice-type`,
          text: 'Back'
        },
        licenceRef,
        pageTitle: 'Enter a licence number'
      })
    })
  })
})
