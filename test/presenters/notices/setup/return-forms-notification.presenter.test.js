'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')
const { generateReturnLogId } = require('../../../support/helpers/return-log.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const ReturnFormsNotificationPresenter = require('../../../../app/presenters/notices/setup/return-forms-notification.presenter.js')

describe('Notices - Setup - Return Forms Notification Presenter', () => {
  const eventId = generateUUID()

  let licenceRef
  let pageData
  let returnForm
  let returnId
  let returnLogId

  beforeEach(async () => {
    licenceRef = generateLicenceRef()

    returnId = generateUUID()

    returnLogId = generateReturnLogId()

    returnForm = new TextEncoder().encode('mock file').buffer

    pageData = {
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
      licenceRef,
      naldAreaCode: 'KAEA',
      pageEntries: [],
      pageTitle: 'Water abstraction daily return',
      purpose: 'A purpose',
      regionAndArea: 'North West / Lower Trent',
      regionCode: '6',
      returnReference: '123456',
      returnsFrequency: 'day',
      siteDescription: 'Water park',
      startDate: '1 January 2025',
      twoPartTariff: false,
      returnLogId,
      returnId
    }
  })

  describe('when called', () => {
    it('returns the data re-formatted as a notification', () => {
      const result = ReturnFormsNotificationPresenter.go(returnForm, pageData, licenceRef, eventId)

      expect(result).to.equal({
        content: returnForm,
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
          due_date: '6 July 2025',
          end_date: '6 June 2025',
          format_id: '123456',
          is_two_part_tariff: false,
          licence_ref: licenceRef,
          naldAreaCode: 'KAEA',
          purpose: 'A purpose',
          qr_url: returnLogId,
          region_code: '6',
          returns_frequency: 'day',
          site_description: 'Water park',
          start_date: '1 January 2025'
        },
        returnLogIds: [returnId]
      })
    })
  })
})
