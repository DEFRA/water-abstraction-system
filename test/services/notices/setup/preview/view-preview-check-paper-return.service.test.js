// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from '../../../../support/stubs/session.stub.js'
import { generateNoticeReferenceCode, generateUUID } from '../../../../support/generators.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../../app/dal/fetch-session.dal.js'

// Thing under test
import ViewPreviewCheckPaperReturnService from '../../../../../app/services/notices/setup/preview/view-preview-check-paper-return.service.js'

describe('Notices - Setup - Preview - View Preview Check Paper Return service', () => {
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

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewPreviewCheckPaperReturnService(session.id, contactHashId)

      expect(result).toEqual({
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
