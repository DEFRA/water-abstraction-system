'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const SelectRecipientsPresenter = require('../../../../app/presenters/notices/setup/select-recipients.presenter.js')

describe('Select Recipients Presenter', () => {
  let session

  beforeEach(() => {
    session = {}
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = SelectRecipientsPresenter.go(session)

      expect(result).to.equal({})
    })
  })
})
