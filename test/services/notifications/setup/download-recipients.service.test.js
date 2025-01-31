'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')
const FetchDownloadRecipientsService = require('../../../../app/services/notifications/setup/fetch-download-recipients.service.js')

// Thing under test
const DownloadRecipientsService = require('../../../../app/services/notifications/setup/download-recipients.service.js')

describe('Notifications Setup - Download recipients service', () => {
  const year = 2025

  let clock
  let session
  let testRecipients

  before(async () => {
    clock = Sinon.useFakeTimers(new Date(`${year}-01-01`))

    session = await SessionHelper.add({ data: { returnsPeriod: 'quarterFour' } })

    testRecipients = _recipients()
    Sinon.stub(FetchDownloadRecipientsService, 'go').resolves(testRecipients)
  })

  afterEach(() => {
    clock.restore()
  })

  describe('when provided with "recipients"', () => {
    it('correctly returns the csv string, filename and type', async () => {
      const result = await DownloadRecipientsService.go(session.id)

      expect(result).to.equal({
        data: 'licence\n"12323"\n"4567"',
        filename: 'recipients.csv',
        type: 'text/csv'
      })
    })
  })
})

function _recipients() {
  return [{ licence_ref: '12323' }, { licence_ref: '4567' }]
}
