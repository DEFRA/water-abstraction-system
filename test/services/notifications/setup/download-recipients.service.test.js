'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const DownloadRecipientsService = require('../../../../app/services/notifications/setup/download-recipients.service.js')

describe('Notifications Setup - Download recipients service', () => {
  let session
  const referenceCode = 'RINV-00R1MQ'

  before(async () => {
    session = await SessionHelper.add({
      data: { returnsPeriod: 'quarterFour', referenceCode, notificationType: 'Returns invitation' }
    })
  })

  it('correctly returns the csv string, filename and type', async () => {
    const result = await DownloadRecipientsService.go(session.id)

    expect(result).to.equal({
      data: 'Licences\n12234\n',
      filename: `Returns invitation - ${referenceCode}.csv`,
      type: 'text/csv'
    })
  })
})
