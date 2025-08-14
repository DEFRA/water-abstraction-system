'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Things we need to stub
const GenerateReturnFormRequest = require('../../../../app/requests/gotenberg/generate-return-form.request.js')
const RecipientsService = require('../../../../app/services/notices/setup/recipients.service.js')

// Thing under test
const PreviewReturnFormsService = require('../../../../app/services/notices/setup/preview-return-forms.service.js')

describe('Notices - Setup - Preview Return Forms Service', () => {
  let contactHashId
  let notifierStub
  let recipient
  let returnId
  let session
  let sessionData

  beforeEach(async () => {
    returnId = '1234'

    recipient = RecipientsFixture.recipients().licenceHolder

    contactHashId = recipient.contact_hash_id

    sessionData = {
      licenceRef: '123',
      dueReturns: [
        {
          dueDate: '2025-07-06',
          endDate: '2025-06-06',
          naldAreaCode: 'MIDLT',
          purpose: 'A purpose',
          regionName: 'North West',
          returnId,
          returnReference: '123456',
          returnsFrequency: 'day',
          siteDescription: 'Water park',
          startDate: '2025-01-01',
          twoPartTariff: false
        }
      ]
    }

    session = await SessionHelper.add({ data: sessionData })

    const buffer = new TextEncoder().encode('mock file').buffer

    Sinon.stub(GenerateReturnFormRequest, 'send').resolves({
      response: {
        body: buffer
      }
    })

    Sinon.stub(RecipientsService, 'go').resolves([
      {
        ...recipient
      },
      {
        contact_hash_id: '630793a76f7f864fe9e85ae193eba76f'
      }
    ])

    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('when called', () => {
    it('returns generated pdf as an array buffer', async () => {
      const result = await PreviewReturnFormsService.go(session.id, contactHashId, returnId)

      expect(result).to.be.instanceOf(ArrayBuffer)
      // The encoded string is 9 chars
      expect(result.byteLength).to.equal(9)
    })

    it('should call "GenerateReturnFormRequest"', async () => {
      await PreviewReturnFormsService.go(session.id, contactHashId, returnId)

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
        dueDate: '6 July 2025',
        endDate: '6 June 2025',
        licenceRef: '123',
        pageTitle: 'Water abstraction daily return',
        purpose: 'A purpose',
        regionAndArea: 'North West / Lower Trent',
        returnReference: '123456',
        siteDescription: 'Water park',
        startDate: '1 January 2025',
        twoPartTariff: false
      })
    })
  })
})
