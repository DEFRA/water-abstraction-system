'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../support/fixtures/recipients.fixtures.js')
const ReturnLogFixture = require('../../../support/fixtures/return-logs.fixture.js')
const { formatLongDate } = require('../../../../app/presenters/base.presenter.js')
const { futureDueDate } = require('../../../../app/presenters/notices/base.presenter.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Thing under test
const PaperReturnNotificationsPresenter = require('../../../../app/presenters/notices/setup/paper-return-notifications.presenter.js')

describe('Notices - Setup - Paper Return Notifications presenter', () => {
  const noticeId = '32f4cab2-ce0c-4711-aac8-fb4941f3b59a'

  let dueReturns
  let dynamicLetterDueDate
  let licenceRef
  let recipients
  let session

  beforeEach(async () => {
    dynamicLetterDueDate = futureDueDate('letter')

    licenceRef = generateLicenceRef()

    dueReturns = [
      {
        ...ReturnLogFixture.dueReturn(),
        dueDate: null,
        licenceRef
      },
      {
        ...ReturnLogFixture.dueReturn(),
        licenceRef
      },
      {
        ...ReturnLogFixture.dueReturn(),
        dueDate: new Date('2025-04-28'),
        licenceRef
      }
    ]

    const dueReturnIds = dueReturns.map((dueReturn) => {
      return dueReturn.returnLogId
    })

    const licenceHolder = RecipientsFixture.returnsNoticeLicenceHolder()
    const returnsTo = RecipientsFixture.returnsNoticeReturnsTo()

    recipients = [
      {
        ...licenceHolder,
        licence_refs: [licenceRef],
        return_log_ids: dueReturnIds
      },
      {
        ...returnsTo,
        licence_refs: [licenceRef],
        return_log_ids: dueReturnIds
      }
    ]

    session = {
      licenceRef,
      dueReturns,
      selectedReturns: [dueReturns[0].returnLogId, dueReturns[2].returnLogId]
    }
  })

  it('correctly presents the data', () => {
    const result = PaperReturnNotificationsPresenter.go(session, recipients, noticeId)

    expect(result).to.equal([
      {
        contactType: 'licence holder',
        dueDate: dynamicLetterDueDate,
        eventId: noticeId,
        licences: [licenceRef],
        messageRef: 'paper return',
        messageType: 'letter',
        personalisation: {
          address_line_1: 'J Returnsholder',
          address_line_2: '4',
          address_line_3: 'Privet Drive',
          address_line_4: 'Little Whinging',
          address_line_5: 'Surrey',
          address_line_6: 'WD25 7LR',
          due_date: formatLongDate(dynamicLetterDueDate),
          end_date: '31 March 2023',
          format_id: dueReturns[0].returnReference,
          is_two_part_tariff: false,
          licence_ref: licenceRef,
          naldAreaCode: 'MIDLT',
          purpose: 'Mineral Washing',
          qr_url: dueReturns[0].returnLogId,
          region_code: '1',
          region_name: 'North West',
          returns_frequency: 'month',
          site_description: 'BOREHOLE AT AVALON',
          start_date: '1 April 2022'
        },
        returnLogIds: [dueReturns[0].returnLogId],
        status: 'pending'
      },
      {
        contactType: 'returns to',
        dueDate: dynamicLetterDueDate,
        eventId: noticeId,
        licences: [licenceRef],
        messageRef: 'paper return',
        messageType: 'letter',
        personalisation: {
          address_line_1: 'J Returnsto',
          address_line_2: '4',
          address_line_3: 'Privet Drive',
          address_line_4: 'Little Whinging',
          address_line_5: 'Surrey',
          address_line_6: 'WD25 7LR',
          due_date: formatLongDate(dynamicLetterDueDate),
          end_date: '31 March 2023',
          format_id: dueReturns[0].returnReference,
          is_two_part_tariff: false,
          licence_ref: licenceRef,
          naldAreaCode: 'MIDLT',
          purpose: 'Mineral Washing',
          qr_url: dueReturns[0].returnLogId,
          region_code: '1',
          region_name: 'North West',
          returns_frequency: 'month',
          site_description: 'BOREHOLE AT AVALON',
          start_date: '1 April 2022'
        },
        returnLogIds: [dueReturns[0].returnLogId],
        status: 'pending'
      },
      {
        contactType: 'licence holder',
        dueDate: dueReturns[2].dueDate,
        eventId: noticeId,
        licences: [licenceRef],
        messageRef: 'paper return',
        messageType: 'letter',
        personalisation: {
          address_line_1: 'J Returnsholder',
          address_line_2: '4',
          address_line_3: 'Privet Drive',
          address_line_4: 'Little Whinging',
          address_line_5: 'Surrey',
          address_line_6: 'WD25 7LR',
          due_date: formatLongDate(dueReturns[2].dueDate),
          end_date: '31 March 2023',
          format_id: dueReturns[2].returnReference,
          is_two_part_tariff: false,
          licence_ref: licenceRef,
          naldAreaCode: 'MIDLT',
          purpose: 'Mineral Washing',
          qr_url: dueReturns[2].returnLogId,
          region_code: '1',
          region_name: 'North West',
          returns_frequency: 'month',
          site_description: 'BOREHOLE AT AVALON',
          start_date: '1 April 2022'
        },
        returnLogIds: [dueReturns[2].returnLogId],
        status: 'pending'
      },
      {
        contactType: 'returns to',
        dueDate: dueReturns[2].dueDate,
        eventId: noticeId,
        licences: [licenceRef],
        messageRef: 'paper return',
        messageType: 'letter',
        personalisation: {
          address_line_1: 'J Returnsto',
          address_line_2: '4',
          address_line_3: 'Privet Drive',
          address_line_4: 'Little Whinging',
          address_line_5: 'Surrey',
          address_line_6: 'WD25 7LR',
          due_date: formatLongDate(dueReturns[2].dueDate),
          end_date: '31 March 2023',
          format_id: dueReturns[2].returnReference,
          is_two_part_tariff: false,
          licence_ref: licenceRef,
          naldAreaCode: 'MIDLT',
          purpose: 'Mineral Washing',
          qr_url: dueReturns[2].returnLogId,
          region_code: '1',
          region_name: 'North West',
          returns_frequency: 'month',
          site_description: 'BOREHOLE AT AVALON',
          start_date: '1 April 2022'
        },
        returnLogIds: [dueReturns[2].returnLogId],
        status: 'pending'
      }
    ])
  })
})
