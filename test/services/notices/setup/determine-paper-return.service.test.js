'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')
const ReturnLogFixture = require('../../../fixtures/return-logs.fixture.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')
const { formatLongDate } = require('../../../../app/presenters/base.presenter.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Thing under test
const DeterminePaperReturnService = require('../../../../app/services/notices/setup/determine-paper-return.service.js')

describe('Notices - Setup - Determine Paper Return Service', () => {
  const eventId = generateUUID()

  let additionalDueReturn
  let dueReturnLog
  let licenceRef
  let recipients
  let session
  let sessionData
  let testRecipients

  beforeEach(async () => {
    licenceRef = generateLicenceRef()

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
      selectedReturns: [dueReturnLog.returnId]
    }

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    describe('and there is one due return log selected', () => {
      it('returns a notification for each combination of recipient and selected due return log', async () => {
        const result = await DeterminePaperReturnService.go(session, testRecipients, eventId)

        expect(result).to.equal([
          {
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
              due_date: formatLongDate(dueReturnLog.dueDate),
              end_date: '31 March 2023',
              format_id: dueReturnLog.returnReference,
              is_two_part_tariff: false,
              licence_ref: licenceRef,
              naldAreaCode: 'MIDLT',
              purpose: 'Mineral Washing',
              qr_url: dueReturnLog.returnLogId,
              region_code: '1',
              region_name: 'North West',
              returns_frequency: 'month',
              site_description: 'BOREHOLE AT AVALON',
              start_date: '1 April 2022'
            },
            returnLogIds: [dueReturnLog.returnId],
            status: 'pending'
          },
          {
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
              due_date: formatLongDate(dueReturnLog.dueDate),
              end_date: '31 March 2023',
              format_id: dueReturnLog.returnReference,
              is_two_part_tariff: false,
              licence_ref: licenceRef,
              naldAreaCode: 'MIDLT',
              purpose: 'Mineral Washing',
              qr_url: dueReturnLog.returnLogId,
              region_code: '1',
              region_name: 'North West',
              returns_frequency: 'month',
              site_description: 'BOREHOLE AT AVALON',
              start_date: '1 April 2022'
            },
            returnLogIds: [dueReturnLog.returnId],
            status: 'pending'
          }
        ])
      })
    })

    describe('and there are multiple due return log selected', () => {
      beforeEach(() => {
        session.selectedReturns.push(additionalDueReturn.returnId)
      })

      it('returns a notification for each combination of recipient and selected due return log', async () => {
        const result = await DeterminePaperReturnService.go(session, testRecipients, eventId)

        expect(result).to.equal([
          {
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
              due_date: formatLongDate(dueReturnLog.dueDate),
              end_date: '31 March 2023',
              format_id: dueReturnLog.returnReference,
              is_two_part_tariff: false,
              licence_ref: licenceRef,
              naldAreaCode: 'MIDLT',
              purpose: 'Mineral Washing',
              qr_url: dueReturnLog.returnLogId,
              region_code: '1',
              region_name: 'North West',
              returns_frequency: 'month',
              site_description: 'BOREHOLE AT AVALON',
              start_date: '1 April 2022'
            },
            returnLogIds: [dueReturnLog.returnId],
            status: 'pending'
          },
          {
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
              due_date: formatLongDate(dueReturnLog.dueDate),
              end_date: '31 March 2023',
              format_id: dueReturnLog.returnReference,
              is_two_part_tariff: false,
              licence_ref: licenceRef,
              naldAreaCode: 'MIDLT',
              purpose: 'Mineral Washing',
              qr_url: dueReturnLog.returnLogId,
              region_code: '1',
              region_name: 'North West',
              returns_frequency: 'month',
              site_description: 'BOREHOLE AT AVALON',
              start_date: '1 April 2022'
            },
            returnLogIds: [dueReturnLog.returnId],
            status: 'pending'
          },
          {
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
              due_date: formatLongDate(additionalDueReturn.dueDate),
              end_date: '31 March 2023',
              format_id: additionalDueReturn.returnReference,
              is_two_part_tariff: false,
              licence_ref: licenceRef,
              naldAreaCode: 'MIDLT',
              purpose: 'Mineral Washing',
              qr_url: additionalDueReturn.returnLogId,
              region_code: '1',
              region_name: 'North West',
              returns_frequency: 'month',
              site_description: 'BOREHOLE AT AVALON',
              start_date: '1 April 2022'
            },
            returnLogIds: [additionalDueReturn.returnId],
            status: 'pending'
          },
          {
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
              due_date: formatLongDate(additionalDueReturn.dueDate),
              end_date: '31 March 2023',
              format_id: additionalDueReturn.returnReference,
              is_two_part_tariff: false,
              licence_ref: licenceRef,
              naldAreaCode: 'MIDLT',
              purpose: 'Mineral Washing',
              qr_url: additionalDueReturn.returnLogId,
              region_code: '1',
              region_name: 'North West',
              returns_frequency: 'month',
              site_description: 'BOREHOLE AT AVALON',
              start_date: '1 April 2022'
            },
            returnLogIds: [additionalDueReturn.returnId],
            status: 'pending'
          }
        ])
      })
    })
  })
})
