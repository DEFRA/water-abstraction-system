'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const ViewSelectAccountService = require('../../../../app/services/billing-accounts/setup/view-select-account.service.js')

describe('Billing Accounts - Setup - Select Account Service', () => {
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {
      billingAccountId: generateUUID()
    }

    session = await SessionHelper.add({ data: sessionData })
  })

  afterEach(async () => {
    await session.$query().delete()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewSelectAccountService.go(session.id)

      expect(result).to.equal({
        backLink: {
          href: `/system/billing-accounts/${sessionData.billingAccountId}`,
          text: 'Back'
        },
        pageTitle: 'Who should the bills go to?'
      })
    })
  })
})
