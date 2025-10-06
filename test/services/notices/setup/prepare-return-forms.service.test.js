'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnLogFixture = require('../../../fixtures/return-logs.fixture.js')
const { formatLongDate } = require('../../../../app/presenters/base.presenter.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Things we need to stub
const GenerateReturnFormRequest = require('../../../../app/requests/gotenberg/generate-return-form.request.js')

// Thing under test
const PrepareReturnFormsService = require('../../../../app/services/notices/setup/prepare-return-forms.service.js')

describe('Notices - Setup - Prepare Return Forms Service', () => {
  const buffer = new TextEncoder().encode('mock file').buffer

  let dueReturnLog
  let licenceRef
  let notification
  let notifierStub

  beforeEach(async () => {
    dueReturnLog = ReturnLogFixture.dueReturn()

    licenceRef = generateLicenceRef()

    notification = {
      eventId: null,
      licences: [licenceRef],
      messageRef: 'pdf.return_form',
      messageType: 'letter',
      personalisation: {
        address_line_1: 'Mr H J Licence holder',
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
      },
      returnLogIds: [dueReturnLog.returnId]
    }

    Sinon.stub(GenerateReturnFormRequest, 'send').resolves({
      succeeded: true,
      response: {
        body: buffer
      }
    })

    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('when called', () => {
    it('returns the request object', async () => {
      const result = await PrepareReturnFormsService.go(notification)

      expect(result).to.equal({
        response: {
          body: buffer
        },
        succeeded: true
      })
    })

    it('returns the generated pdf as an array buffer', async () => {
      const result = await PrepareReturnFormsService.go(notification)

      expect(result.response.body).to.be.instanceOf(ArrayBuffer)
      // The encoded string is 9 chars
      expect(result.response.body.byteLength).to.equal(9)
    })

    it('should call "GenerateReturnFormRequest" with the page data for the provided "returnId"', async () => {
      await PrepareReturnFormsService.go(notification)

      expect(GenerateReturnFormRequest.send.calledOnce).to.be.true()

      const actualCallArgs = GenerateReturnFormRequest.send.getCall(0).args[0]
      expect(actualCallArgs).to.equal({
        address: {
          address_line_1: 'Mr H J Licence holder',
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
        returnId: dueReturnLog.returnId,
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
