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
      dueDate: '2025-07-06',
      endDate: '2025-06-06',
      naldAreaCode: 'MIDLT',
      purpose: 'A purpose',
      regionName: 'North West',
      returnId: '1234',
      returnReference: '123456',
      returnsFrequency: 'day',
      siteDescription: 'Water park',
      startDate: '2025-01-01',
      twoPartTariff: false
    }

    additionalDueReturn = {
      dueDate: '2025-07-06',
      endDate: '2025-06-06',
      naldAreaCode: 'MIDLT',
      purpose: 'A purpose',
      regionName: 'North West',
      returnId: '5678',
      returnReference: '568907',
      returnsFrequency: 'day',
      siteDescription: 'Water park',
      startDate: '2025-01-01',
      twoPartTariff: false
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
            licences: `["${licenceRef}"]`,
            messageRef: 'pdf.return_form',
            messageType: 'letter',
            personalisation: {
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
              pageEntries: result[0].personalisation.pageEntries,
              pageTitle: 'Water abstraction daily return',
              purpose: 'A purpose',
              regionAndArea: 'North West / Lower Trent',
              returnReference: '123456',
              returnsFrequency: 'day',
              siteDescription: 'Water park',
              startDate: '1 January 2025',
              twoPartTariff: false
            },
            reference: referenceCode
          },
          {
            content: buffer,
            eventId,
            licences: `["${licenceRef}"]`,
            messageRef: 'pdf.return_form',
            messageType: 'letter',
            personalisation: {
              address: {
                address_line_1: 'Mr H J Returns to',
                address_line_2: 'INVALID ADDRESS - Needs a valid postcode or country outside the UK',
                address_line_3: '2',
                address_line_4: 'Privet Drive',
                address_line_5: 'Little Whinging',
                address_line_6: 'Surrey'
              },
              dueDate: '6 July 2025',
              endDate: '6 June 2025',
              licenceRef,
              pageEntries: result[1].personalisation.pageEntries,
              pageTitle: 'Water abstraction daily return',
              purpose: 'A purpose',
              regionAndArea: 'North West / Lower Trent',
              returnReference: '123456',
              returnsFrequency: 'day',
              siteDescription: 'Water park',
              startDate: '1 January 2025',
              twoPartTariff: false
            },
            reference: referenceCode
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
            licences: `["${licenceRef}"]`,
            messageRef: 'pdf.return_form',
            messageType: 'letter',
            personalisation: {
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
              pageEntries: result[0].personalisation.pageEntries,
              pageTitle: 'Water abstraction daily return',
              purpose: 'A purpose',
              regionAndArea: 'North West / Lower Trent',
              returnReference: '123456',
              returnsFrequency: 'day',
              siteDescription: 'Water park',
              startDate: '1 January 2025',
              twoPartTariff: false
            },
            reference: referenceCode
          },
          {
            content: buffer,
            eventId,
            licences: `["${licenceRef}"]`,
            messageRef: 'pdf.return_form',
            messageType: 'letter',
            personalisation: {
              address: {
                address_line_1: 'Mr H J Returns to',
                address_line_2: 'INVALID ADDRESS - Needs a valid postcode or country outside the UK',
                address_line_3: '2',
                address_line_4: 'Privet Drive',
                address_line_5: 'Little Whinging',
                address_line_6: 'Surrey'
              },
              dueDate: '6 July 2025',
              endDate: '6 June 2025',
              licenceRef,
              pageEntries: result[1].personalisation.pageEntries,
              pageTitle: 'Water abstraction daily return',
              purpose: 'A purpose',
              regionAndArea: 'North West / Lower Trent',
              returnReference: '123456',
              returnsFrequency: 'day',
              siteDescription: 'Water park',
              startDate: '1 January 2025',
              twoPartTariff: false
            },
            reference: referenceCode
          },
          {
            content: buffer,
            eventId,
            licences: `["${licenceRef}"]`,
            messageRef: 'pdf.return_form',
            messageType: 'letter',
            personalisation: {
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
              pageEntries: result[2].personalisation.pageEntries,
              pageTitle: 'Water abstraction daily return',
              purpose: 'A purpose',
              regionAndArea: 'North West / Lower Trent',
              returnReference: '568907',
              returnsFrequency: 'day',
              siteDescription: 'Water park',
              startDate: '1 January 2025',
              twoPartTariff: false
            },
            reference: referenceCode
          },
          {
            content: buffer,
            eventId,
            licences: `["${licenceRef}"]`,
            messageRef: 'pdf.return_form',
            messageType: 'letter',
            personalisation: {
              address: {
                address_line_1: 'Mr H J Returns to',
                address_line_2: 'INVALID ADDRESS - Needs a valid postcode or country outside the UK',
                address_line_3: '2',
                address_line_4: 'Privet Drive',
                address_line_5: 'Little Whinging',
                address_line_6: 'Surrey'
              },
              dueDate: '6 July 2025',
              endDate: '6 June 2025',
              licenceRef,
              pageEntries: result[3].personalisation.pageEntries,
              pageTitle: 'Water abstraction daily return',
              purpose: 'A purpose',
              regionAndArea: 'North West / Lower Trent',
              returnReference: '568907',
              returnsFrequency: 'day',
              siteDescription: 'Water park',
              startDate: '1 January 2025',
              twoPartTariff: false
            },
            reference: referenceCode
          }
        ])
      })
    })
  })
})
