'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const ViewSelectAccountPresenter = require('../../../../app/presenters/billing-accounts/setup/view-select-account.presenter.js')

describe('Billing Accounts - Setup - Select Account Presenter', () => {
  let session

  beforeEach(() => {
    session = {
      billingAccountId: generateUUID()
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ViewSelectAccountPresenter.go(session)

      expect(result).to.equal({
        backLink: {
          href: `/system/billing-accounts/${session.billingAccountId}`,
          text: 'Back'
        },
        pageTitle: 'Who should the bills go to?'
      })
    })
  })
})
