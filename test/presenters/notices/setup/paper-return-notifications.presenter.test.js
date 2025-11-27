'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')
const ReturnLogFixture = require('../../../fixtures/return-logs.fixture.js')
const { formatLongDate } = require('../../../../app/presenters/base.presenter.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Thing under test
const PaperReturnNotificationsPresenter = require('../../../../app/presenters/notices/setup/paper-return-notifications.presenter.js')

describe('Notices - Setup - Paper Return Notifications presenter', () => {
  const noticeId = '32f4cab2-ce0c-4711-aac8-fb4941f3b59a'

  let dueReturns
  let licenceRef
  let recipients
  let session

  beforeEach(async () => {
    licenceRef = generateLicenceRef()

    const fixtureData = RecipientsFixture.recipients()

    recipients = [fixtureData.licenceHolder, fixtureData.returnsTo]

    dueReturns = [
      {
        ...ReturnLogFixture.dueReturn(),
        licenceRef
      },
      {
        ...ReturnLogFixture.dueReturn(),
        licenceRef
      }
    ]

    session = {
      licenceRef,
      dueReturns,
      selectedReturns: [dueReturns[0].returnId]
    }
  })

  it('correctly presents the data', () => {
    const result = PaperReturnNotificationsPresenter.go(session, recipients, noticeId)

    expect(result).to.equal([
      {
        dueDate: dueReturns[0].dueDate,
        eventId: noticeId,
        licences: [licenceRef],
        messageRef: 'pdf.return_form',
        messageType: 'letter',
        personalisation: {
          address_line_1: 'Mr H J Potter',
          address_line_2: '1',
          address_line_3: 'Privet Drive',
          address_line_4: 'Little Whinging',
          address_line_5: 'Surrey',
          address_line_6: 'WD25 7LR',
          due_date: formatLongDate(dueReturns[0].dueDate),
          end_date: '31 March 2023',
          format_id: dueReturns[0].returnReference,
          is_two_part_tariff: false,
          licence_ref: licenceRef,
          naldAreaCode: 'MIDLT',
          purpose: 'Mineral Washing',
          qr_url: dueReturns[0].returnId,
          region_code: '1',
          region_name: 'North West',
          returns_frequency: 'month',
          site_description: 'BOREHOLE AT AVALON',
          start_date: '1 April 2022'
        },
        returnLogIds: [dueReturns[0].returnId],
        status: 'pending'
      },
      {
        dueDate: dueReturns[0].dueDate,
        eventId: noticeId,
        licences: [licenceRef],
        messageRef: 'pdf.return_form',
        messageType: 'letter',
        personalisation: {
          address_line_1: 'Mr H J Weasley',
          address_line_2: 'INVALID ADDRESS - Needs a valid postcode or country outside the UK',
          address_line_3: '2',
          address_line_4: 'Privet Drive',
          address_line_5: 'Little Whinging',
          address_line_6: 'Surrey',
          due_date: formatLongDate(dueReturns[0].dueDate),
          end_date: '31 March 2023',
          format_id: dueReturns[0].returnReference,
          is_two_part_tariff: false,
          licence_ref: licenceRef,
          naldAreaCode: 'MIDLT',
          purpose: 'Mineral Washing',
          qr_url: dueReturns[0].returnId,
          region_code: '1',
          region_name: 'North West',
          returns_frequency: 'month',
          site_description: 'BOREHOLE AT AVALON',
          start_date: '1 April 2022'
        },
        returnLogIds: [dueReturns[0].returnId],
        status: 'pending'
      }
    ])
  })
})
