'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

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
      const result = await ViewLicenceService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'notices',
        backLink: {
          href: '/system/notices',
          text: 'Back'
        },
        licenceRef,
        pageTitle: 'Enter a licence number'
      })
    })
  })
})
