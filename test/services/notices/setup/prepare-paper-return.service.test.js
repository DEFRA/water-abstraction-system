// Test helpers
import * as ReturnLogFixture from '../../../support/fixtures/return-logs.fixture.js'
import LicenceHelper from '../../../support/helpers/licence.helper.js'
import { formatLongDate } from '../../../../app/presenters/base.presenter.js'

// Things we need to stub
import * as GeneratePaperReturnRequest from '../../../../app/requests/gotenberg/generate-paper-return.request.js'
import GlobalNotifierStub from '../../../support/stubs/global-notifier.stub.js'

// Thing under test
import PreparePaperReturnService from '../../../../app/services/notices/setup/prepare-paper-return.service.js'

describe('Notices - Setup - Prepare Paper Return service', () => {
  const buffer = new TextEncoder().encode('mock file').buffer

  let dueReturnLog
  let licenceRef
  let notification
  let notifierStub

  beforeEach(async () => {
    dueReturnLog = ReturnLogFixture.dueReturn()

    licenceRef = LicenceHelper.generateLicenceRef()

    notification = {
      eventId: null,
      licences: [licenceRef],
      messageRef: 'paper return',
      messageType: 'letter',
      personalisation: {
        address_line_1: 'Harry Potter',
        address_line_2: '1',
        address_line_3: 'Privet Drive',
        address_line_4: 'Little Whinging',
        address_line_5: 'Surrey',
        address_line_6: 'WD25 7LR',
        due_date: dueReturnLog.dueDate,
        end_date: dueReturnLog.endDate,
        format_id: dueReturnLog.returnReference,
        is_two_part_tariff: false,
        licence_ref: licenceRef,
        naldAreaCode: 'MIDLT',
        purpose: 'Mineral Washing',
        qr_url: dueReturnLog.returnLogId,
        region_code: '1',
        region_name: 'North West',
        returns_frequency: dueReturnLog.returnsFrequency,
        site_description: 'BOREHOLE AT AVALON',
        start_date: dueReturnLog.startDate
      }
    }

    vi.spyOn(GeneratePaperReturnRequest, 'send').mockResolvedValue({
      succeeded: true,
      response: {
        body: buffer
      }
    })

    notifierStub = GlobalNotifierStub()
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete globalThis.GlobalNotifier
  })

  describe('when called', () => {
    it('returns the request object', async () => {
      const result = await PreparePaperReturnService(notification)

      expect(result).toEqual({
        response: {
          body: buffer
        },
        succeeded: true
      })
    })

    it('returns the generated pdf as an array buffer', async () => {
      const result = await PreparePaperReturnService(notification)

      expect(result.response.body).toBeInstanceOf(ArrayBuffer)
      // The encoded string is 9 chars
      expect(result.response.body.byteLength).toEqual(9)
    })

    it('should call "GeneratePaperReturnRequest" with the page data for the provided "returnLogId"', async () => {
      await PreparePaperReturnService(notification)

      expect(GeneratePaperReturnRequest.send).toHaveBeenCalledOnce()

      const actualCallArgs = GeneratePaperReturnRequest.send.mock.calls[0][0]
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
