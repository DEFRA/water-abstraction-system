// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import RecipientsFixture from '../../../support/fixtures/recipients.fixture.js'
import ReturnLogFixture from '../../../support/fixtures/return-logs.fixture.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'
import { formatLongDate } from '../../../../app/presenters/base.presenter.js'

// Things we need to stub
import * as FetchRecipientsService from '../../../../app/services/notices/setup/fetch-recipients.service.js'
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'
import * as GeneratePaperReturnRequest from '../../../../app/requests/gotenberg/generate-paper-return.request.js'
import GlobalNotifierStub from '../../../support/stubs/global-notifier.stub.js'

// Thing under test
import ProcessPreviewPaperReturnService from '../../../../app/services/notices/setup/process-preview-paper-return.service.js'

describe('Notices - Setup - Process Preview Paper Return service', () => {
  let contactHashId
  let dueReturnLog
  let licenceRef
  let notifierStub
  let recipient
  let returnLogId
  let session
  let sessionData

  beforeEach(() => {
    dueReturnLog = ReturnLogFixture.dueReturn()

    licenceRef = dueReturnLog.licenceRef
    returnLogId = dueReturnLog.returnLogId

    recipient = RecipientsFixture.recipients().licenceHolder

    contactHashId = recipient.contact_hash_id

    sessionData = {
      licenceRef,
      dueReturns: [dueReturnLog]
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    const buffer = new TextEncoder().encode('mock file').buffer

    vi.spyOn(GeneratePaperReturnRequest, 'default').mockResolvedValue({
      response: {
        body: buffer
      }
    })

    vi.spyOn(FetchRecipientsService, 'default').mockResolvedValue([
      {
        ...recipient
      },
      {
        contact_hash_id: '630793a76f7f864fe9e85ae193eba76f'
      }
    ])

    notifierStub = GlobalNotifierStub()
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete globalThis.GlobalNotifier
  })

  describe('when called', () => {
    it('returns generated pdf as an array buffer', async () => {
      const result = await ProcessPreviewPaperReturnService(session.id, contactHashId, returnLogId)

      expect(result).toBeInstanceOf(ArrayBuffer)
      // The encoded string is 9 chars
      expect(result.byteLength).toEqual(9)
    })

    it('should call "GeneratePaperReturnRequest"', async () => {
      await ProcessPreviewPaperReturnService(session.id, contactHashId, returnLogId)

      expect(GeneratePaperReturnRequest.default).toHaveBeenCalledOnce()

      const actualCallArgs = GeneratePaperReturnRequest.default.mock.calls[0][0]

      expect(actualCallArgs).toEqual({
        address: {
          address_line_1: 'Harry Potter',
          address_line_2: '1',
          address_line_3: 'Privet Drive',
          address_line_4: 'Little Whinging',
          address_line_5: 'Surrey',
          address_line_6: 'WD25 7LR',
          address_line_7: undefined
        },
        dueDate: formatLongDate(dueReturnLog.dueDate),
        endDate: '31 March 2023',
        licenceRef,
        naldAreaCode: 'MIDLT',
        pageEntries: actualCallArgs.pageEntries,
        pageTitle: 'Water abstraction monthly return',
        purpose: 'Mineral Washing',
        regionAndArea: 'North West / Lower Trent',
        regionCode: '1',
        returnLogId: dueReturnLog.returnLogId,
        returnsFrequency: 'month',
        returnReference: dueReturnLog.returnReference,
        siteDescription: 'BOREHOLE AT AVALON',
        startDate: '1 April 2022',
        twoPartTariff: false
      })
    })
  })
})
