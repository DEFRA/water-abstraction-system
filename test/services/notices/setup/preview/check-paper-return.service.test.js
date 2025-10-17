'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../../support/helpers/session.helper.js')
const { generateUUID } = require('../../../../../app/lib/general.lib.js')

// Thing under test
const CheckPaperReturnService = require('../../../../../app/services/notices/setup/preview/check-paper-return.service.js')

describe('Notices - Setup - Preview - Check Paper Return Service', () => {
  const contactHashId = '9df5923f179a0ed55c13173c16651ed9'

  let dueReturn
  let session
  let sessionData

  beforeEach(async () => {
    dueReturn = {
      siteDescription: 'Potable Water Supply - Direct',
      endDate: '2003-03-31',
      returnId: generateUUID(),
      returnReference: '3135',
      startDate: '2002-04-01'
    }

    sessionData = {
      dueReturns: [dueReturn],
      referenceCode: 'PRTF-WJUKBX',
      selectedReturns: [dueReturn.returnId]
    }

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await CheckPaperReturnService.go(session.id, contactHashId)

      expect(result).to.equal({
        activeNavBar: 'notices',
        backLink: `/system/notices/setup/${session.id}/check`,
        caption: 'Notice PRTF-WJUKBX',
        pageTitle: 'Check the recipient previews',
        returnLogs: [
          {
            action: {
              link: `/system/notices/setup/${session.id}/preview/${contactHashId}/paper-return/${dueReturn.returnId}`,
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
