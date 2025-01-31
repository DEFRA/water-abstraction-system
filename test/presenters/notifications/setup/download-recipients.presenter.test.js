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
      const result = DownloadRecipientsPresenter.go(recipients)

      expect(result).to.equal('licence\n"12323"\n"4567"')
    })

    it('correctly formats the headers', () => {
      const result = DownloadRecipientsPresenter.go(recipients)

      const [headers] = result.split('\n')

      expect(headers).to.equal('licence')
    })

    it('correctly formats a row', () => {
      const result = DownloadRecipientsPresenter.go(recipients)

      const [, row] = result.split('\n')

      expect(row).to.equal('"12323"')
    })
  })
})

function _recipients() {
  return [{ licence_ref: '12323' }, { licence_ref: '4567' }]
}
