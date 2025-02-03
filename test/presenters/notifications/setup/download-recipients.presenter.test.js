'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const DownloadRecipientsPresenter = require('../../../../app/presenters/notifications/setup/download-recipients.presenter.js')

describe.only('Notifications Setup - Download recipients presenter', () => {
  let recipients

  beforeEach(() => {
    recipients = _recipients()
  })

  describe('when provided with "recipients"', () => {
    it('correctly formats the data to a csv string', () => {
      const result = DownloadRecipientsPresenter.go(recipients)

      expect(result).to.equal('"Licences"\n"12323"\n"4567"\n')
    })

    it('correctly formats the headers', () => {
      const result = DownloadRecipientsPresenter.go(recipients)

      const [headers] = result.split('\n')

      expect(headers).to.equal('"Licences"')
    })

    it('correctly formats a row', () => {
      const result = DownloadRecipientsPresenter.go(recipients)

      const [, firstRow] = result.split('\n')

      expect(firstRow).to.equal('"12323"')
    })

    describe('and there are special characters', () => {
      describe('and the character is ","', () => {
        beforeEach(() => {
          recipients[0] = { licence_ref: '123,456' }
        })

        it('should handle the special character', () => {
          const result = DownloadRecipientsPresenter.go(recipients)

          const [, firstRow] = result.split('\n')

          expect(firstRow).to.equal('"123,456"')
        })
      })

      describe('and the character is ":"', () => {
        beforeEach(() => {
          recipients[0] = { licence_ref: '123:456' }
        })

        it('should handle the special character', () => {
          const result = DownloadRecipientsPresenter.go(recipients)

          const [, firstRow] = result.split('\n')

          expect(firstRow).to.equal('"123:456"')
        })
      })

      describe('and the character is """"', () => {
        beforeEach(() => {
          recipients[0] = { licence_ref: '123""456' }
        })

        it('should handle the special character', () => {
          const result = DownloadRecipientsPresenter.go(recipients)

          const [, firstRow] = result.split('\n')

          expect(firstRow).to.equal('"123""""456"')
        })
      })
    })
  })
})

function _recipients() {
  return [{ licence_ref: '12323' }, { licence_ref: '4567' }]
}
