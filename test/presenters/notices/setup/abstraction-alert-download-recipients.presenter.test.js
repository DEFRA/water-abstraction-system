'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AbstractionAlertSessionData = require('../../../fixtures/abstraction-alert-session-data.fixture.js')
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')

// Thing under test
const AbstractionAlertDownloadRecipientsPresenter = require('../../../../app/presenters/notices/setup/abstraction-alerts-download-recipients.presenter.js')

describe('Notices - Setup - Abstraction alert download recipients presenter', () => {
  let session
  let recipients
  let testRecipients

  beforeEach(() => {
    recipients = RecipientsFixture.alertsRecipients()

    testRecipients = [...Object.values(recipients)]

    const relevantLicenceMonitoringStations = AbstractionAlertSessionData.relevantLicenceMonitoringStations([
      recipients.primaryUser.licence_refs,
      recipients.licenceHolder.licence_refs,
      recipients.additionalContact.licence_refs
    ])

    session = {
      relevantLicenceMonitoringStations,
      notificationType: 'Abstraction alert'
    }
  })

  it('correctly formats the data to a csv string', () => {
    const result = AbstractionAlertDownloadRecipientsPresenter.go(testRecipients, session)

    expect(result).to.equal(
      // Headers
      'Licence,Abstraction periods,Measure type,Threshold,Notification type,Message type,Contact type,Email,Recipient name,Address line 1,Address line 2,Address line 3,Address line 4,Address line 5,Address line 6,Postcode\n' +
        // Row - Primary user
        `"${recipients.primaryUser.licence_refs}","1 February to 1 January","level","1000 m","Abstraction alert","email","Primary user","primary.user@important.com",,,,,,,,\n` +
        // Row - Licence holder
        `"${recipients.licenceHolder.licence_refs}","1 January to 31 March","flow","100 m3/s","Abstraction alert","letter","Licence holder",,"Mr H J Licence holder","1","Privet Drive",,,"Little Whinging",,"WD25 7LR"\n` +
        // Row - Additional contact
        `"${recipients.additionalContact.licence_refs}","1 January to 31 March","level","100 m","Abstraction alert","email","Additional contact","additional.contact@important.com",,,,,,,,\n`
    )
  })

  it('correctly formats the headers', () => {
    const result = AbstractionAlertDownloadRecipientsPresenter.go(testRecipients, session)

    let [headers] = result.split('\n')
    // We want to test the header includes the new line
    headers += '\n'

    expect(headers).to.equal(
      'Licence,' +
        'Abstraction periods,' +
        'Measure type,' +
        'Threshold,' +
        'Notification type,' +
        'Message type,' +
        'Contact type,' +
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

  describe('when the recipient is an "additional contact"', () => {
    it('correctly formats the row', () => {
      const result = AbstractionAlertDownloadRecipientsPresenter.go([recipients.additionalContact], session)

      let [, row] = result.split('\n')
      // We want to test the row includes the new line
      row += '\n'

      expect(row).to.equal(
        `"${recipients.additionalContact.licence_refs}",` + // Licence
          '"1 January to 31 March",' + // 'Abstraction periods'
          '"level",' + // 'Measure type'
          '"100 m",' + // 'Threshold'
          '"Abstraction alert",' + // 'Notification type'
          '"email",' + // 'Message type'
          '"Additional contact",' + // 'Contact type'
          '"additional.contact@important.com",' + // Email
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

  describe('when the recipient is a "primary_user"', () => {
    it('correctly formats the row', () => {
      const result = AbstractionAlertDownloadRecipientsPresenter.go([recipients.primaryUser], session)

      let [, row] = result.split('\n')
      // We want to test the row includes the new line
      row += '\n'

      expect(row).to.equal(
        `"${recipients.primaryUser.licence_refs}",` + // Licence
          '"1 February to 1 January",' + // 'Abstraction periods'
          '"level",' + // 'Measure type'
          '"1000 m",' + // 'Threshold'
          '"Abstraction alert",' + // 'Notification type'
          '"email",' + // 'Message type'
          '"Primary user",' + // 'Contact type'
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

  describe('when the recipient is a "licence holder"', () => {
    describe('and the "contact" is a "person"', () => {
      it('correctly formats the row', () => {
        const result = AbstractionAlertDownloadRecipientsPresenter.go([recipients.licenceHolder], session)

        let [, row] = result.split('\n')
        // We want to test the row includes the new line
        row += '\n'

        expect(row).to.equal(
          `"${recipients.licenceHolder.licence_refs}",` + // Licence
            '"1 January to 31 March",' + // 'Abstraction periods'
            '"flow",' + // 'Measure type'
            '"100 m3/s",' + // 'Threshold'
            '"Abstraction alert",' + // 'Notification type'
            '"letter",' + // 'Message type'
            '"Licence holder",' + // 'Contact type'
            ',' + // Email
            '"Mr H J Licence holder",' + // 'Recipient name''
            '"1",' + // 'Address line 1'
            '"Privet Drive",' + // 'Address line 2'
            ',' + // 'Address line 3'
            ',' + // 'Address line 4'
            '"Little Whinging",' + // 'Address line 5' - town
            ',' + // 'Address line 6' - country
            '"WD25 7LR"' + // Postcode
            '\n' // End of CSV line
        )
      })
    })

    describe('and the "contact" is a "organisation"', () => {
      it('correctly formats the row', () => {
        const result = AbstractionAlertDownloadRecipientsPresenter.go(
          [
            {
              ...recipients.licenceHolder,
              contact: {
                ...recipients.licenceHolder.contact,
                type: 'Organisation',
                name: 'Gringotts'
              }
            }
          ],
          session
        )

        let [, row] = result.split('\n')
        // We want to test the row includes the new line
        row += '\n'

        expect(row).to.equal(
          `"${recipients.licenceHolder.licence_refs}",` + // Licence
            '"1 January to 31 March",' + // 'Abstraction periods'
            '"flow",' + // 'Measure type'
            '"100 m3/s",' + // 'Threshold'
            '"Abstraction alert",' + // 'Notification type'
            '"letter",' + // 'Message type'
            '"Licence holder",' + // 'Contact type'
            ',' + // Email
            '"Gringotts",' + // 'Recipient name''
            '"1",' + // 'Address line 1'
            '"Privet Drive",' + // 'Address line 2'
            ',' + // 'Address line 3'
            ',' + // 'Address line 4'
            '"Little Whinging",' + // 'Address line 5' - town
            ',' + // 'Address line 6' - country
            '"WD25 7LR"' + // Postcode
            '\n' // End of CSV line
        )
      })
    })
  })

  describe('and there are recipients related to multiple licence refs', () => {
    let recipients

    beforeEach(async () => {
      recipients = RecipientsFixture.alertsRecipients()

      testRecipients = [
        recipients.licenceHolder,
        recipients.primaryUser,
        {
          ...recipients.additionalContact,
          licence_refs: `${recipients.primaryUser.licence_refs},${recipients.licenceHolder.licence_refs}`
        }
      ]

      const abstractionAlertSessionData = AbstractionAlertSessionData.get()

      const licenceMonitoringStationTwo = abstractionAlertSessionData.licenceMonitoringStations[1]

      const relevantLicenceMonitoringStations = [
        {
          ...licenceMonitoringStationTwo,
          licence: {
            licenceRef: recipients.licenceHolder.licence_refs
          }
        },
        {
          ...licenceMonitoringStationTwo,
          licence: {
            licenceRef: recipients.primaryUser.licence_refs
          }
        }
      ]

      session = {
        relevantLicenceMonitoringStations,
        notificationType: 'Abstraction alert'
      }
    })

    it('correctly returns the csv string, filename and type', () => {
      const result = AbstractionAlertDownloadRecipientsPresenter.go(testRecipients, session)

      expect(result).to.equal(
        // Headers
        'Licence,Abstraction periods,Measure type,Threshold,Notification type,Message type,Contact type,Email,Recipient name,Address line 1,Address line 2,Address line 3,Address line 4,Address line 5,Address line 6,Postcode\n' +
          // Row - licence holder
          `"${recipients.licenceHolder.licence_refs}","1 January to 31 March","flow","100 m3/s","Abstraction alert","letter","Licence holder",,"Mr H J Licence holder","1","Privet Drive",,,"Little Whinging",,"WD25 7LR"\n` +
          // Row - additional contact for same recipient - with unique licence ref
          `"${recipients.licenceHolder.licence_refs}","1 January to 31 March","flow","100 m3/s","Abstraction alert","email","Additional contact","additional.contact@important.com",,,,,,,,\n` +
          // Row - Primary user
          `"${recipients.primaryUser.licence_refs}","1 January to 31 March","flow","100 m3/s","Abstraction alert","email","Primary user","primary.user@important.com",,,,,,,,\n` +
          // Row - additional contact for same recipient - with unique licence ref
          `"${recipients.primaryUser.licence_refs}","1 January to 31 March","flow","100 m3/s","Abstraction alert","email","Additional contact","additional.contact@important.com",,,,,,,,\n`
      )
    })
  })
})
