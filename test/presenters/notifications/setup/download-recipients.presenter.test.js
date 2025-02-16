'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const DownloadRecipientsPresenter = require('../../../../app/presenters/notifications/setup/download-recipients.presenter.js')

describe('Notifications Setup - Download recipients presenter', () => {
  let recipients

  beforeEach(() => {
    recipients = _recipients()
  })

  describe('when provided with "recipients"', () => {
    it('correctly formats the data to a csv string', () => {
      const result = DownloadRecipientsPresenter.go([
        recipients.primaryUser,
        recipients.licenceHolder,
        recipients.returnsTo,
        recipients.organisation
      ])

      expect(result).to.equal(
        // Headers
        'Licence,Return references,Returns period start date,Returns period end date,Returns due date,Message type,Message reference,Email,Recipient name,Address line 1,Address line 2,Address line 3,Address line 4,Address line 5,Address line 6,Postcode\n' +
          // Row - Primary user
          '"123/46","2434","2018-01-01","2019-01-01","2021-01-01","email","invitations","primary.user@important.com",,,,,,,,\n' +
          // Row - Licence holder
          '"1/343/3","376439279","2018-01-01","2019-01-01","2021-01-01","letter","invitations",,"Mr J Licence holder only","4","Privet Drive","Line 3","Line 4","Little Whinging","United Kingdom","WD25 7LR"\n' +
          // Row - Returns to
          '"1/343/3","376439279","2018-01-01","2019-01-01","2021-01-01","letter","invitations",,"Mr J Returns to (same licence ref as licence holder)","4","Privet Drive","Line 3","Line 4","Surrey","United Kingdom","WD25 7LR"\n' +
          //  Row - Licence holder - organisation
          '"1/343/3","376439279","2018-01-01","2019-01-01","2021-01-01","letter","invitations",,"Gringotts","4","Privet Drive","Line 3","Line 4","Little Whinging","United Kingdom","WD25 7LR"\n'
      )
    })

    it('correctly formats the headers', () => {
      const result = DownloadRecipientsPresenter.go([recipients.primaryUser])

      let [headers] = result.split('\n')
      // We want to test the header includes the new line
      headers += '\n'

      expect(headers).to.equal(
        'Licence,' +
          'Return references,' +
          'Returns period start date,' +
          'Returns period end date,' +
          'Returns due date,' +
          'Message type,' +
          'Message reference,' +
          'Email,' +
          'Recipient name,' +
          'Address line 1,' +
          'Address line 2,' +
          'Address line 3,' +
          'Address line 4,' +
          'Address line 5,' +
          'Address line 6,' +
          'Postcode' +
          '\n'
      )
    })

    describe('when the recipient is a "primary_user"', () => {
      it('correctly formats the row', () => {
        const result = DownloadRecipientsPresenter.go([recipients.primaryUser])

        let [, row] = result.split('\n')
        // We want to test the row includes the new line
        row += '\n'

        expect(row).to.equal(
          '"123/46",' + // Licence
            '"2434",' + // 'Return references'
            '"2018-01-01",' + // 'Returns period start date'
            '"2019-01-01",' + // 'Returns period end date'
            '"2021-01-01",' + // 'Returns due date'
            '"email",' + // 'Message type'
            '"invitations",' + // 'Message reference'
            '"primary.user@important.com",' + // Email
            ',' + // 'Recipient name''
            ',' + // 'Address line 1'
            ',' + // 'Address line 2'
            ',' + // 'Address line 3'
            ',' + // 'Address line 4'
            ',' + // 'Address line 5'
            ',' + // 'Address line 6'
            '\n' // Postcode and End of CSV line
        )
      })
    })

    describe('when the recipient has a "contact"', () => {
      describe('and the "contact" is a "person"', () => {
        describe('and the "person" is a "Licence holder"', () => {
          it('correctly formats the row', () => {
            const result = DownloadRecipientsPresenter.go([recipients.licenceHolder])

            let [, row] = result.split('\n')
            // We want to test the row includes the new line
            row += '\n'

            expect(row).to.equal(
              '"1/343/3",' + // Licence
                '"376439279",' + // 'Return references'
                '"2018-01-01",' + // 'Returns period start date'
                '"2019-01-01",' + // 'Returns period end date'
                '"2021-01-01",' + // 'Returns due date'
                '"letter",' + // 'Message type'
                '"invitations",' + // 'Message reference'
                ',' + // Email
                '"Mr J Licence holder only",' + // 'Recipient name''
                '"4",' + // 'Address line 1'
                '"Privet Drive",' + // 'Address line 2'
                '"Line 3",' + // 'Address line 3'
                '"Line 4",' + // 'Address line 4'
                '"Little Whinging",' + // 'Address line 5' - town
                '"United Kingdom",' + // 'Address line 6' - country
                '"WD25 7LR"' + // Postcode
                '\n' // End of CSV line
            )
          })
        })

        describe('and the "person" is a "Returns to"', () => {
          it('correctly formats the row', () => {
            const result = DownloadRecipientsPresenter.go([recipients.returnsTo])

            let [, row] = result.split('\n')
            // We want to test the row includes the new line
            row += '\n'

            expect(row).to.equal(
              '"1/343/3",' + // Licence
                '"376439279",' + // 'Return references'
                '"2018-01-01",' + // 'Returns period start date'
                '"2019-01-01",' + // 'Returns period end date'
                '"2021-01-01",' + // 'Returns due date'
                '"letter",' + // 'Message type'
                '"invitations",' + // 'Message reference'
                ',' + // Email
                '"Mr J Returns to (same licence ref as licence holder)",' + // 'Recipient name''
                '"4",' + // 'Address line 1'
                '"Privet Drive",' + // 'Address line 2'
                '"Line 3",' + // 'Address line 3'
                '"Line 4",' + // 'Address line 4'
                '"Surrey",' + // 'Address line 5' - town / county
                '"United Kingdom",' + // 'Address line 6' - country
                '"WD25 7LR"' + // Postcode
                '\n' // End of CSV line
            )
          })
        })
      })

      describe('and the "contact" is a "organisation"', () => {
        it('correctly formats the row', () => {
          const result = DownloadRecipientsPresenter.go([recipients.organisation])

          let [, row] = result.split('\n')
          // We want to test the row includes the new line
          row += '\n'

          expect(row).to.equal(
            '"1/343/3",' + // Licence
              '"376439279",' + // 'Return references'
              '"2018-01-01",' + // 'Returns period start date'
              '"2019-01-01",' + // 'Returns period end date'
              '"2021-01-01",' + // 'Returns due date'
              '"letter",' + // 'Message type'
              '"invitations",' + // 'Message reference'
              ',' + // Email
              '"Gringotts",' + // 'Recipient name'' - organisation
              '"4",' + // 'Address line 1'
              '"Privet Drive",' + // 'Address line 2'
              '"Line 3",' + // 'Address line 3'
              '"Line 4",' + // 'Address line 4'
              '"Little Whinging",' + // 'Address line 5' - town
              '"United Kingdom",' + // 'Address line 6' - country
              '"WD25 7LR"' + // Postcode
              '\n' // End of CSV line
          )
        })
      })
    })
  })
})

function _recipients() {
  return {
    primaryUser: {
      contact: null,
      contact_type: 'Primary user',
      due_date: new Date('2021-01-01'),
      email: 'primary.user@important.com',
      end_date: new Date('2019-01-01'),
      licence_ref: '123/46',
      return_reference: '2434',
      start_date: new Date('2018-01-01')
    },
    licenceHolder: {
      contact: {
        addressLine1: '4',
        addressLine2: 'Privet Drive',
        addressLine3: 'Line 3',
        addressLine4: 'Line 4',
        country: 'United Kingdom',
        county: 'Surrey',
        forename: 'Harry',
        initials: 'J',
        name: 'Licence holder only',
        postcode: 'WD25 7LR',
        role: 'Licence holder',
        salutation: 'Mr',
        town: 'Little Whinging',
        type: 'Person'
      },
      contact_type: 'Licence holder',
      due_date: new Date('2021-01-01'),
      email: null,
      end_date: new Date('2019-01-01'),
      licence_ref: '1/343/3',
      return_reference: '376439279',
      start_date: new Date('2018-01-01')
    },
    returnsTo: {
      contact: {
        addressLine1: '4',
        addressLine2: 'Privet Drive',
        addressLine3: 'Line 3',
        addressLine4: 'Line 4',
        country: 'United Kingdom',
        county: 'Surrey',
        forename: 'Harry',
        initials: 'J',
        name: 'Returns to (same licence ref as licence holder)',
        postcode: 'WD25 7LR',
        role: 'Licence holder',
        salutation: 'Mr',
        town: '',
        type: 'Person'
      },
      contact_type: 'Returns to',
      due_date: new Date('2021-01-01'),
      email: null,
      end_date: new Date('2019-01-01'),
      licence_ref: '1/343/3',
      return_reference: '376439279',
      start_date: new Date('2018-01-01')
    },
    organisation: {
      contact: {
        addressLine1: '4',
        addressLine2: 'Privet Drive',
        addressLine3: 'Line 3',
        addressLine4: 'Line 4',
        country: 'United Kingdom',
        county: 'Surrey',
        forename: 'Harry',
        initials: 'J',
        name: 'Gringotts',
        postcode: 'WD25 7LR',
        role: 'Licence holder',
        salutation: 'Mr',
        town: 'Little Whinging',
        type: 'Organisation'
      },
      contact_type: 'Licence holder',
      due_date: new Date('2021-01-01'),
      email: null,
      end_date: new Date('2019-01-01'),
      licence_ref: '1/343/3',
      return_reference: '376439279',
      start_date: new Date('2018-01-01')
    }
  }
}
