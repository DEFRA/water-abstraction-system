'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const RemoveCompanyContactPresenter = require('../../../app/presenters/company-contacts/remove-company-contact.presenter.js')

describe('Company Contacts - Remove Company Contact Presenter', () => {
  beforeEach(() => {})

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = RemoveCompanyContactPresenter.go()

      expect(result).to.equal({
        backLink: {
          href: '',
          text: 'Back'
        },
        pageTitle: `You're about to remove this contact`
      })
    })
  })
})
