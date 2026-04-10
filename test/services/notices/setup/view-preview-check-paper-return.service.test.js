'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')
const { generateNoticeReferenceCode, generateUUID } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const ViewPreviewCheckPaperReturnService = require('../../../../app/services/notices/setup/view-preview-check-paper-return.service.js')

describe('Notices - Setup - View Preview Check Paper Return service', () => {
  const contactHashId = '9df5923f179a0ed55c13173c16651ed9'

  let dueReturn
  let session
  let sessionData

  beforeEach(() => {
    dueReturn = {
      siteDescription: 'Potable Water Supply - Direct',
      endDate: '2003-03-31',
      returnLogId: generateUUID(),
      returnReference: '3135',
      startDate: '2002-04-01'
    }

    sessionData = {
      dueReturns: [dueReturn],
      referenceCode: generateNoticeReferenceCode('PRTF-'),
      selectedReturns: [dueReturn.returnLogId]
    }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewPreviewCheckPaperReturnService.go(session.id, contactHashId)

      expect(result).to.equal({
        activeNavBar: 'notices',
        backLink: {
          href: `/system/notices/setup/${session.id}/check`,
          text: 'Back'
        },
        pageTitle: 'Check the recipient previews',
        pageTitleCaption: `Notice ${session.referenceCode}`,
        returnLogs: [
          {
            action: {
              link: `/system/notices/setup/${session.id}/preview/${contactHashId}/paper-return/${dueReturn.returnLogId}`,
              text: 'Preview'
            },
            returnPeriod: '1 April 2002 to 31 March 2003',
            returnReference: '3135',
            siteDescription: 'Potable Water Supply - Direct'
          }
        ]
      })
    })
  })
})
