'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const DownloadRecipientsService = require('../../../../app/services/notifications/setup/download-recipients.service.js')

describe('Notifications Setup - Download recipients service', () => {
  describe('when provided with "recipients"', () => {
    it('correctly returns the csv string, filename and type', async () => {
      const result = await DownloadRecipientsService.go()

      expect(result).to.equal({
        data: 'Licences\n12234\n',
        filename: 'recipients.csv',
        type: 'text/csv'
      })
    })
  })
})
