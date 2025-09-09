'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const DownloadAdHocRecipientsPresenter = require('../../../../app/presenters/notices/setup/download-adhoc-recipients.presenter.js')

describe('Notices - Setup - Download AdHoc Recipients presenter', () => {
  const notificationType = 'Returns invitation'

  let recipients
  let session

  beforeEach(() => {
    recipients = _recipients()

    session = {
      notificationType
    }
  })

  describe('when provided with "recipients"', () => {
    it('correctly formats the data to a csv string', () => {
      const result = DownloadAdHocRecipientsPresenter.go(
        [recipients.primaryUser, recipients.licenceHolder, recipients.returnsTo, recipients.organisation],
        session
      )

      expect(result).to.equal(
        // Headers
        'Licence,Notification type,Message type,Contact type,Email,Address line 1,Address line 2,Address line 3,Address line 4,Address line 5,Address line 6,Address line 7\n' +
          // Row - Primary user
          '"123/46","Returns invitation","email","Primary user","primary.user@important.com",,,,,,,\n' +
          // Row - Licence holder
          '"1/343/3","Returns invitation","letter","Licence holder",,"Mr J Licence holder only","4","Privet Drive","Line 3","Line 4, Little Whinging","Surrey","WD25 7LR"\n' +
          // Row - Returns to
          '"1/343/3","Returns invitation","letter","Returns to",,"Mr J Returns to (same licence ref as licence holder)","4","Privet Drive","Line 3","Line 4","Surrey","WD25 7LR"\n' +
          //  Row - Licence holder - organisation
          '"1/343/3","Returns invitation","letter","Licence holder",,"Gringotts","4","Privet Drive","Line 3","Line 4, Little Whinging","Surrey","WD25 7LR"\n'
      )
    })

    it('correctly formats the headers', () => {
      const result = DownloadAdHocRecipientsPresenter.go([recipients.primaryUser], session)

      let [headers] = result.split('\n')
      // We want to test the header includes the new line
      headers += '\n'

      expect(headers).to.equal(
        'Licence,' +
          'Notification type,' +
          'Message type,' +
          'Contact type,' +
          'Email,' +
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

    describe('when the recipient is a "primary_user"', () => {
      it('correctly formats the row', () => {
        const result = DownloadAdHocRecipientsPresenter.go([recipients.primaryUser], session)

        let [, row] = result.split('\n')
        // We want to test the row includes the new line
        row += '\n'

        expect(row).to.equal(
          '"123/46",' + // Licence
            '"Returns invitation",' + // Notification type
            '"email",' + // Message type
            '"Primary user",' + // Contact type
            '"primary.user@important.com",' + // Email
            ',' + // Address line 1
            ',' + // Address line 2
            ',' + // Address line 3
            ',' + // Address line 4
            ',' + // Address line 5
            ',' + // Address line 6
            '\n' // Address line 7 and End of CSV line
        )
      })
    })

    describe('when the recipient has a "contact"', () => {
      describe('and the "contact" is a "person"', () => {
        describe('and the "person" is a "Licence holder"', () => {
          it('correctly formats the row', () => {
            const result = DownloadAdHocRecipientsPresenter.go([recipients.licenceHolder], session)

            let [, row] = result.split('\n')
            // We want to test the row includes the new line
            row += '\n'

            expect(row).to.equal(
              '"1/343/3",' + // Licence
                '"Returns invitation",' + // Notification type
                '"letter",' + // Message type
                '"Licence holder",' + // Contact type
                ',' + // Email
                '"Mr J Licence holder only",' + // Address line 1
                '"4",' + // Address line 2
                '"Privet Drive",' + // Address line 3
                '"Line 3",' + // Address line 4
                '"Line 4, Little Whinging",' + // Address line 5
                '"Surrey",' + // Address line 6
                '"WD25 7LR"' + // Address line 7
                '\n' // End of CSV line
            )
          })
        })

        describe('and the "person" is a "Returns to"', () => {
          it('correctly formats the row', () => {
            const result = DownloadAdHocRecipientsPresenter.go([recipients.returnsTo], session)

            let [, row] = result.split('\n')
            // We want to test the row includes the new line
            row += '\n'

            expect(row).to.equal(
              '"1/343/3",' + // Licence
                '"Returns invitation",' + // Notification type
                '"letter",' + // Message type
                '"Returns to",' + // Contact type
                ',' + // Email
                '"Mr J Returns to (same licence ref as licence holder)",' + // Address line 1
                '"4",' + // Address line 2
                '"Privet Drive",' + // Address line 3
                '"Line 3",' + // Address line 4
                '"Line 4",' + // Address line 5
                '"Surrey",' + // Address line 6
                '"WD25 7LR"' + // Address line 7
                '\n' // End of CSV line
            )
          })
        })
      })

      describe('and the "contact" is a "organisation"', () => {
        it('correctly formats the row', () => {
          const result = DownloadAdHocRecipientsPresenter.go([recipients.organisation], session)

          let [, row] = result.split('\n')
          // We want to test the row includes the new line
          row += '\n'

          expect(row).to.equal(
            '"1/343/3",' + // Licence
              '"Returns invitation",' + // Notification type
              '"letter",' + // Message type
              '"Licence holder",' + // Contact type
              ',' + // Email
              '"Gringotts",' + // Address line 1
              '"4",' + // Address line 2
              '"Privet Drive",' + // Address line 3
              '"Line 3",' + // Address line 4
              '"Line 4, Little Whinging",' + // Address line 5
              '"Surrey",' + // Address line 6
              '"WD25 7LR"' + // Address line 7
              '\n' // End of CSV line
          )
        })
      })
    })

    describe('and the "noticeType" is ""', () => {})
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
