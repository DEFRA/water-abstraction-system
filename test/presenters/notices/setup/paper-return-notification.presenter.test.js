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
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const PaperReturnNotificationPresenter = require('../../../../app/presenters/notices/setup/paper-return-notification.presenter.js')

describe('Notices - Setup - Paper Return Notification Presenter', () => {
  const eventId = generateUUID()

  let dueReturnLog
  let licenceRef
  let recipient

  beforeEach(async () => {
    licenceRef = generateLicenceRef()

    recipient = RecipientsFixture.recipients().licenceHolder

    dueReturnLog = ReturnLogFixture.dueReturn()
  })

  describe('when called', () => {
    it('returns the data re-formatted as a notification', () => {
      const result = PaperReturnNotificationPresenter.go(recipient, licenceRef, eventId, dueReturnLog)

      expect(result).to.equal({
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
      })
    })
  })
})
