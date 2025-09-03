'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const RecipientNamePresenter = require('../../../../app/presenters/notices/setup/recipient-name.presenter.js')

describe('Notices - Setup - Recipient Name Presenter', () => {
  let session

  beforeEach(() => {
    session = {}
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = RecipientNamePresenter.go(session)

      expect(result).to.equal({})
    })
  })
})
