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
const SessionHelper = require('../../../support/helpers/session.helper.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')
const { generateReferenceCode } = require('../../../support/helpers/notification.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const PrepareReturnFormsService = require('../../../../app/services/notices/setup/prepare-return-forms.service.js')

// Thing under test
const DetermineReturnFormsService = require('../../../../app/services/notices/setup/determine-return-forms.service.js')

describe('Notices - Setup - Determine Return Forms Service', () => {
  const eventId = generateUUID()

  let additionalDueReturn
  let buffer
  let dueReturnLog
  let licenceRef
  let recipients
  let referenceCode
  let session
  let sessionData
  let testRecipients

  beforeEach(async () => {
    licenceRef = generateLicenceRef()

    referenceCode = generateReferenceCode('PRTF')

    recipients = RecipientsFixture.recipients()
    testRecipients = [recipients.licenceHolder, recipients.returnsTo]

    dueReturnLog = {
      ...ReturnLogFixture.dueReturn(),
      licenceRef
    }

    additionalDueReturn = {
      ...ReturnLogFixture.dueReturn(),
      licenceRef
    }

    sessionData = {
      licenceRef,
      dueReturns: [dueReturnLog, additionalDueReturn],
      referenceCode,
      selectedReturns: [dueReturnLog.returnId]
    }

    session = await SessionHelper.add({ data: sessionData })

    buffer = new TextEncoder().encode('mock file').buffer

    Sinon.stub(PrepareReturnFormsService, 'go').resolves(buffer)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('and there is one due return log selected', () => {
      it('returns a notification for each combination of recipient and selected due return log', async () => {
        const result = await DetermineReturnFormsService.go(session, testRecipients, eventId)

        expect(result).to.equal([
          {
            content: buffer,
            eventId,
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
              address_line_7: undefined,
              due_date: '28 April 2023',
              end_date: '31 March 2023',
              format_id: dueReturnLog.returnReference,
              is_two_part_tariff: false,
              licence_ref: licenceRef,
              naldAreaCode: 'MIDLT',
              purpose: 'Mineral Washing',
              qr_url: dueReturnLog.returnLogId,
              region_code: '1',
              returns_frequency: 'month',
              site_description: 'BOREHOLE AT AVALON',
              start_date: '1 April 2022'
            },
            reference: referenceCode,
            returnLogIds: [dueReturnLog.returnId]
          },
          {
            content: buffer,
            eventId,
            licences: [licenceRef],
            messageRef: 'pdf.return_form',
            messageType: 'letter',
            personalisation: {
              address_line_1: 'Mr H J Returns to',
              address_line_2: 'INVALID ADDRESS - Needs a valid postcode or country outside the UK',
              address_line_3: '2',
              address_line_4: 'Privet Drive',
              address_line_5: 'Little Whinging',
              address_line_6: 'Surrey',
              address_line_7: undefined,
              due_date: '28 April 2023',
              end_date: '31 March 2023',
              format_id: dueReturnLog.returnReference,
              is_two_part_tariff: false,
              licence_ref: licenceRef,
              naldAreaCode: 'MIDLT',
              purpose: 'Mineral Washing',
              qr_url: dueReturnLog.returnLogId,
              region_code: '1',
              returns_frequency: 'month',
              site_description: 'BOREHOLE AT AVALON',
              start_date: '1 April 2022'
            },
            reference: referenceCode,
            returnLogIds: [dueReturnLog.returnId]
          }
        ])
      })
    })

    describe('and there are multiple due return log selected', () => {
      beforeEach(() => {
        session.selectedReturns.push(additionalDueReturn.returnId)
      })

      it('returns a notification for each combination of recipient and selected due return log', async () => {
        const result = await DetermineReturnFormsService.go(session, testRecipients, eventId)

        expect(result).to.equal([
          {
            content: buffer,
            eventId,
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
              address_line_7: undefined,
              due_date: '28 April 2023',
              end_date: '31 March 2023',
              format_id: dueReturnLog.returnReference,
              is_two_part_tariff: false,
              licence_ref: licenceRef,
              naldAreaCode: 'MIDLT',
              purpose: 'Mineral Washing',
              qr_url: dueReturnLog.returnLogId,
              region_code: '1',
              returns_frequency: 'month',
              site_description: 'BOREHOLE AT AVALON',
              start_date: '1 April 2022'
            },
            reference: referenceCode,
            returnLogIds: [dueReturnLog.returnId]
          },
          {
            content: buffer,
            eventId,
            licences: [licenceRef],
            messageRef: 'pdf.return_form',
            messageType: 'letter',
            personalisation: {
              address_line_1: 'Mr H J Returns to',
              address_line_2: 'INVALID ADDRESS - Needs a valid postcode or country outside the UK',
              address_line_3: '2',
              address_line_4: 'Privet Drive',
              address_line_5: 'Little Whinging',
              address_line_6: 'Surrey',
              address_line_7: undefined,
              due_date: '28 April 2023',
              end_date: '31 March 2023',
              format_id: dueReturnLog.returnReference,
              is_two_part_tariff: false,
              licence_ref: licenceRef,
              naldAreaCode: 'MIDLT',
              purpose: 'Mineral Washing',
              qr_url: dueReturnLog.returnLogId,
              region_code: '1',
              returns_frequency: 'month',
              site_description: 'BOREHOLE AT AVALON',
              start_date: '1 April 2022'
            },
            reference: referenceCode,
            returnLogIds: [dueReturnLog.returnId]
          },
          {
            content: buffer,
            eventId,
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
              address_line_7: undefined,
              due_date: '28 April 2023',
              end_date: '31 March 2023',
              format_id: additionalDueReturn.returnReference,
              is_two_part_tariff: false,
              licence_ref: licenceRef,
              naldAreaCode: 'MIDLT',
              purpose: 'Mineral Washing',
              qr_url: additionalDueReturn.returnLogId,
              region_code: '1',
              returns_frequency: 'month',
              site_description: 'BOREHOLE AT AVALON',
              start_date: '1 April 2022'
            },
            reference: referenceCode,
            returnLogIds: [additionalDueReturn.returnId]
          },
          {
            content: buffer,
            eventId,
            licences: [licenceRef],
            messageRef: 'pdf.return_form',
            messageType: 'letter',
            personalisation: {
              address_line_1: 'Mr H J Returns to',
              address_line_2: 'INVALID ADDRESS - Needs a valid postcode or country outside the UK',
              address_line_3: '2',
              address_line_4: 'Privet Drive',
              address_line_5: 'Little Whinging',
              address_line_6: 'Surrey',
              address_line_7: undefined,
              due_date: '28 April 2023',
              end_date: '31 March 2023',
              format_id: additionalDueReturn.returnReference,
              is_two_part_tariff: false,
              licence_ref: licenceRef,
              naldAreaCode: 'MIDLT',
              purpose: 'Mineral Washing',
              qr_url: additionalDueReturn.returnLogId,
              region_code: '1',
              returns_frequency: 'month',
              site_description: 'BOREHOLE AT AVALON',
              start_date: '1 April 2022'
            },
            reference: referenceCode,
            returnLogIds: [additionalDueReturn.returnId]
          }
        ])
      })
    })
  })
})
