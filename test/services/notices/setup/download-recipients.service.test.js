'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const FetchAbstractionAlertRecipientsService = require('../../../../app/services/notices/setup/fetch-abstraction-alert-recipients.service.js')
const FetchDownloadRecipientsService = require('../../../../app/services/notices/setup/fetch-download-recipients.service.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const DownloadRecipientsService = require('../../../../app/services/notices/setup/download-recipients.service.js')
const AbstractionAlertSessionData = require('../../../fixtures/abstraction-alert-session-data.fixture.js')
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')

describe('Notices - Setup - Download recipients service', () => {
  let referenceCode
  let session
  let testRecipients

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the journey is for returns ', () => {
    let removeLicences

    before(async () => {
      removeLicences = ''
      referenceCode = 'RREM-00R1MQ'

      session = await SessionHelper.add({
        data: { returnsPeriod: 'quarterFour', referenceCode, notificationType: 'Returns reminder', removeLicences }
      })

      testRecipients = _recipients()
      Sinon.stub(FetchDownloadRecipientsService, 'go').resolves(testRecipients)
    })

    it('correctly returns the csv string, filename and type', async () => {
      const result = await DownloadRecipientsService.go(session.id)

      expect(result).to.equal({
        data:
          // Headers
          'Licence,Return reference,Return period start date,Return period end date,Return due date,Notification type,Message type,Contact type,Email,Recipient name,Address line 1,Address line 2,Address line 3,Address line 4,Address line 5,Address line 6,Postcode\n' +
          // Row - licence holder
          '"1/343/3","376439279",2018-01-01,2019-01-01,2021-01-01,"Returns reminder","letter","Licence holder",,"Mr J Licence holder only","4","Privet Drive","Line 3","Line 4","Little Whinging","United Kingdom","WD25 7LR"\n',
        filename: `Returns reminder - ${referenceCode}.csv`,
        type: 'text/csv'
      })
    })
  })

  describe('when the journey is "abstraction-alerts"', () => {
    let recipients

    describe('and there are recipients', () => {
      before(async () => {
        recipients = RecipientsFixture.alertsRecipients()

        testRecipients = [...Object.values(recipients)]

        const relevantLicenceMonitoringStations = AbstractionAlertSessionData.relevantLicenceMonitoringStations([
          recipients.licenceHolder.licence_refs
        ])

        referenceCode = 'WAA-123'

        session = await SessionHelper.add({
          data: {
            notificationType: 'Abstraction alert',
            journey: 'abstraction-alert',
            referenceCode,
            relevantLicenceMonitoringStations
          }
        })

        Sinon.stub(FetchAbstractionAlertRecipientsService, 'go').resolves(testRecipients)
      })

      it('correctly returns the csv string, filename and type', async () => {
        const result = await DownloadRecipientsService.go(session.id)

        expect(result).to.equal({
          data:
            // Headers
            'Licence,Abstraction periods,Measure type,Threshold,Notification type,Message type,Contact type,Email,Recipient name,Address line 1,Address line 2,Address line 3,Address line 4,Address line 5,Address line 6,Postcode\n' +
            // Row - licence holder
            `"${recipients.licenceHolder.licence_refs}","1 February to 1 January","level","1000 m","Abstraction alert","letter","Licence holder",,"Mr H J Licence holder","1","Privet Drive",,,"Little Whinging",,"WD25 7LR"\n`,
          filename: `Abstraction alert - ${referenceCode}.csv`,
          type: 'text/csv'
        })
      })
    })

    describe('and there is a recipient used for multiple licences', () => {
      let recipients

      before(async () => {
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

        referenceCode = 'WAA-123'

        session = await SessionHelper.add({
          data: {
            notificationType: 'Abstraction alert',
            journey: 'abstraction-alert',
            referenceCode,
            relevantLicenceMonitoringStations
          }
        })

        Sinon.stub(FetchAbstractionAlertRecipientsService, 'go').resolves(testRecipients)
      })

      it('correctly returns the csv string, filename and type', async () => {
        const result = await DownloadRecipientsService.go(session.id)

        expect(result).to.equal({
          data:
            // Headers
            'Licence,Abstraction periods,Measure type,Threshold,Notification type,Message type,Contact type,Email,Recipient name,Address line 1,Address line 2,Address line 3,Address line 4,Address line 5,Address line 6,Postcode\n' +
            // Row - licence holder
            `"${recipients.licenceHolder.licence_refs}","1 January to 31 March","flow","100 m3/s","Abstraction alert","letter","Licence holder",,"Mr H J Licence holder","1","Privet Drive",,,"Little Whinging",,"WD25 7LR"\n` +
            // Row - additional contact for same recipient - with unique licence ref
            `"${recipients.licenceHolder.licence_refs}","1 January to 31 March","flow","100 m3/s","Abstraction alert","email","Additional contact","additional.contact@important.com",,,,,,,,\n` +
            // Row - Primary user
            `"${recipients.primaryUser.licence_refs}","1 January to 31 March","flow","100 m3/s","Abstraction alert","email","Primary user","primary.user@important.com",,,,,,,,\n` +
            // Row - additional contact for same recipient - with unique licence ref
            `"${recipients.primaryUser.licence_refs}","1 January to 31 March","flow","100 m3/s","Abstraction alert","email","Additional contact","additional.contact@important.com",,,,,,,,\n`,
          filename: `Abstraction alert - ${referenceCode}.csv`,
          type: 'text/csv'
        })
      })
    })
  })
})

function _recipients() {
  return [
    {
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
    }
  ]
}
