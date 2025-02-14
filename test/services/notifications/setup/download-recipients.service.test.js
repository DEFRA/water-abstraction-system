'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const FetchDownloadRecipientsService = require('../../../../app/services/notifications/setup/fetch-download-recipients.service.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const DownloadRecipientsService = require('../../../../app/services/notifications/setup/download-recipients.service.js')

describe('Notifications Setup - Download recipients service', () => {
  const referenceCode = 'RINV-00R1MQ'

  let removeLicences
  let session
  let testRecipients

  before(async () => {
    removeLicences = ''

    session = await SessionHelper.add({
      data: { returnsPeriod: 'quarterFour', referenceCode, notificationType: 'Returns invitation', removeLicences }
    })

    testRecipients = _recipients()
    Sinon.stub(FetchDownloadRecipientsService, 'go').resolves(testRecipients)
  })

  it('correctly returns the csv string, filename and type', async () => {
    const result = await DownloadRecipientsService.go(session.id)

    expect(result).to.equal({
      data:
        // Headers
        'Licences,Return references,Returns period start date,Returns period end date,Returns due date,Message type,Message reference,Email,Recipient name,Address line 1,Address line 2,Address line 3,Address line 4,Address line 5,Address line 6,Postcode\n' +
        // Row - licence holder
        '"1/343/3","376439279","2018-01-01","2019-01-01","2021-01-01","letter","invitations",,"Mr J Licence holder only","4","Privet Drive","Line 3","Line 4","Little Whinging","United Kingdom","WD25 7LR"\n',
      filename: `Returns invitation - ${referenceCode}.csv`,
      type: 'text/csv'
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
