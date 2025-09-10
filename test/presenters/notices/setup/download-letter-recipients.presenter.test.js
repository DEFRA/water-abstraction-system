'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const DownloadLetterRecipientsPresenter = require('../../../../app/presenters/notices/setup/download-letter-recipients.presenter.js')

describe('Notices - Setup - Download Letter Recipients presenter', () => {
  const notificationType = 'Returns invitation'
  const returnReference = '376439279'

  let dueReturnOne
  let dueReturnTwo
  let recipients
  let session
  let licenceRef

  beforeEach(() => {
    recipients = RecipientsFixture.recipients()

    licenceRef = generateLicenceRef()

    dueReturnOne = {
      description: 'Potable Water Supply - Direct',
      dueDate: '2021-01-01',
      endDate: '2019-01-01',
      returnId: generateUUID(),
      returnReference,
      startDate: '2018-01-01'
    }

    dueReturnTwo = {
      description: 'Potable Water Supply - Direct',
      dueDate: '2021-01-01',
      endDate: '2019-01-01',
      returnId: generateUUID(),
      returnReference,
      startDate: '2018-01-01'
    }

    session = {
      licenceRef,
      notificationType,
      dueReturns: [dueReturnOne, dueReturnTwo],
      selectedReturns: [dueReturnOne.returnId]
    }
  })

  describe('when provided with "recipients"', () => {
    it('correctly formats the data to a csv string', () => {
      const result = DownloadLetterRecipientsPresenter.go([recipients.licenceHolder, recipients.returnsTo], session)

      expect(result).to.equal(
        // Headers
        'Licence,Return reference,Return period start date,Return period end date,Return due date,Notification type,Message type,Contact type,Address line 1,Address line 2,Address line 3,Address line 4,Address line 5,Address line 6,Address line 7\n' +
          // Row - Licence holder
          `"${licenceRef}","${returnReference}",2018-01-01,2019-01-01,2021-01-01,"Return forms","letter","Licence holder","Mr H J Licence holder","1","Privet Drive","Little Whinging","Surrey","WD25 7LR",\n` +
          // Row - Returns to
          `"${licenceRef}","${returnReference}",2018-01-01,2019-01-01,2021-01-01,"Return forms","letter","Returns to","Mr H J Returns to","INVALID ADDRESS - Needs a valid postcode or country outside the UK","2","Privet Drive","Little Whinging","Surrey",\n`
      )
    })

    it('correctly formats the headers', () => {
      const result = DownloadLetterRecipientsPresenter.go([recipients.licenceHolder], session)

      let [headers] = result.split('\n')
      // We want to test the header includes the new line
      headers += '\n'

      expect(headers).to.equal(
        'Licence,' +
          'Return reference,' +
          'Return period start date,' +
          'Return period end date,' +
          'Return due date,' +
          'Notification type,' +
          'Message type,' +
          'Contact type,' +
          'Address line 1,' +
          'Address line 2,' +
          'Address line 3,' +
          'Address line 4,' +
          'Address line 5,' +
          'Address line 6,' +
          'Address line 7' +
          '\n'
      )
    })

    describe('when the recipient has a "contact"', () => {
      describe('and the "contact" is a "person"', () => {
        describe('and the "person" is a "Licence holder"', () => {
          it('correctly formats the row', () => {
            const result = DownloadLetterRecipientsPresenter.go([recipients.licenceHolder], session)

            let [, row] = result.split('\n')
            // We want to test the row includes the new line
            row += '\n'

            expect(row).to.equal(
              `"${licenceRef}",` + // Licence
                `"${returnReference}",` + // Return reference
                '2018-01-01,' + // Return period start date
                '2019-01-01,' + // Return period end date
                '2021-01-01,' + // Return due date
                '"Return forms",' + // Notification type
                '"letter",' + // Message type
                '"Licence holder",' + // Contact type
                '"Mr H J Licence holder",' + // Address line 1
                '"1",' + // Address line 2
                '"Privet Drive",' + // Address line 3
                '"Little Whinging",' + // Address line 4
                '"Surrey",' + // Address line 5
                '"WD25 7LR",' + // Address line 6
                '' + // Address line 7
                '\n' // End of CSV line
            )
          })
        })

        describe('and the "person" is a "Returns to"', () => {
          it('correctly formats the row', () => {
            const result = DownloadLetterRecipientsPresenter.go([recipients.returnsTo], session)

            let [, row] = result.split('\n')
            // We want to test the row includes the new line
            row += '\n'

            expect(row).to.equal(
              `"${licenceRef}",` + // Licence
                `"${returnReference}",` + // Return reference
                '2018-01-01,' + // Return period start date
                '2019-01-01,' + // Return period end date
                '2021-01-01,' + // Return due date
                '"Return forms",' + // Notification type
                '"letter",' + // Message type
                '"Returns to",' + // Contact type
                '"Mr H J Returns to",' + // Address line 1
                '"INVALID ADDRESS - Needs a valid postcode or country outside the UK",' + // Address line 2
                '"2",' + // Address line 3
                '"Privet Drive",' + // Address line 4
                '"Little Whinging",' + // Address line 5
                '"Surrey",' + // Address line 6
                '' + // Address line 7
                '\n' // End of CSV line
            )
          })
        })
      })
    })
  })
})
