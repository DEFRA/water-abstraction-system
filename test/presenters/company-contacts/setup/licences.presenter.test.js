'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const LicencesPresenter = require('../../../../app/presenters/company-contacts/setup/licences.presenter.js')

describe('Company Contacts - Setup - Licences Presenter', () => {
  let session

  beforeEach(() => {
    session = { id: generateUUID() }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = LicencesPresenter.go(session)

      expect(result).to.equal({
        backLink: {
          href: `/system/company-contacts/setup/${session.id}/abstraction-alerts`,
          text: 'Back'
        },
        pageTitle: 'Select the licences they should get water abstraction alerts emails for'
      })
    })
  })
})
