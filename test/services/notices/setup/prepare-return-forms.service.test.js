'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')
const ReturnLogFixture = require('../../../fixtures/return-logs.fixture.js')

// Things we need to stub
const GenerateReturnFormRequest = require('../../../../app/requests/gotenberg/generate-return-form.request.js')

// Thing under test
const PrepareReturnFormsService = require('../../../../app/services/notices/setup/prepare-return-forms.service.js')

describe('Notices - Setup - Prepare Return Forms Service', () => {
  const buffer = new TextEncoder().encode('mock file').buffer

  let dueReturnLog
  let licenceRef
  let notifierStub
  let recipient

  beforeEach(async () => {
    recipient = RecipientsFixture.recipients().licenceHolder

    dueReturnLog = ReturnLogFixture.dueReturn()

    licenceRef = dueReturnLog.licenceRef

    Sinon.stub(GenerateReturnFormRequest, 'send').resolves({
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
    it('returns generated pdf as an array buffer', async () => {
      const result = await PrepareReturnFormsService.go(licenceRef, dueReturnLog, recipient)

      expect(result).to.be.instanceOf(ArrayBuffer)
      // The encoded string is 9 chars
      expect(result.byteLength).to.equal(9)
    })

    it('should call "GenerateReturnFormRequest" with the page data for the provided "returnId"', async () => {
      await PrepareReturnFormsService.go(licenceRef, dueReturnLog, recipient)

      expect(GenerateReturnFormRequest.send.calledOnce).to.be.true()

      const actualCallArgs = GenerateReturnFormRequest.send.getCall(0).args[0]
      expect(actualCallArgs).to.equal({
        address: {
          address_line_1: 'Mr H J Licence holder',
          address_line_2: '1',
          address_line_3: 'Privet Drive',
          address_line_4: 'Little Whinging',
          address_line_5: 'Surrey',
          address_line_6: 'WD25 7LR'
        },
        dueDate: '28 April 2023',
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
