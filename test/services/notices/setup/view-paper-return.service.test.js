'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const ViewPaperReturnService = require('../../../../app/services/notices/setup/view-paper-return.service.js')

describe('Notices - Setup - View Paper Return service', () => {
  let dueReturn
  let licenceRef
  let session
  let sessionData

  beforeEach(async () => {
    licenceRef = generateLicenceRef()

    dueReturn = {
      siteDescription: 'Potable Water Supply - Direct',
      endDate: '2003-03-31',
      returnLogId: generateUUID(),
      returnReference: '3135',
      startDate: '2002-04-01'
    }

    sessionData = { licenceRef, dueReturns: [dueReturn] }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewPaperReturnService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'notices',
        backLink: {
          href: `/system/notices/setup/${session.id}/notice-type`,
          text: 'Back'
        },
        pageTitle: 'Select the returns for the paper return',
        returns: [
          {
            checked: false,
            hint: {
              text: '1 April 2002 to 31 March 2003'
            },
            text: `${dueReturn.returnReference} Potable Water Supply - Direct`,
            value: dueReturn.returnLogId
          }
        ]
      })
    })
  })
})
