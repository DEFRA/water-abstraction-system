'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../../support/fixtures/customers.fixture.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Things we need to stub
const CreateCompanyContactService = require('../../../../app/services/company-contacts/setup/create-company-contact.service.js')

// Thing under test
const SubmitCheckService = require('../../../../app/services/company-contacts/setup/submit-check.service.js')

describe('Company Contacts - Setup - Check Service', () => {
  let company
  let session
  let sessionData

  beforeEach(async () => {
    company = CustomersFixtures.company()

    Sinon.stub(CreateCompanyContactService, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    beforeEach(async () => {
      sessionData = {
        company,
        name: 'Eric',
        email: 'eric@test.com',
        abstractionAlerts: 'yes'
      }

      session = await SessionHelper.add({ data: sessionData })
    })

    it('returns the company id', async () => {
      const result = await SubmitCheckService.go(session.id)

      expect(result).to.equal({
        redirectUrl: `/system/companies/${company.id}/contacts`
      })
    })

    it('persists the company contact details', async () => {
      await SubmitCheckService.go(session.id)

      const actualContact = CreateCompanyContactService.go.args[0]

      expect(actualContact).to.equal([
        company.id,
        {
          name: 'Eric',
          email: 'eric@test.com',
          abstractionAlerts: true
        }
      ])
    })

    describe('and "abstractionAlerts" is "yes"', () => {
      it('persists the "abstractionAlerts" as "true', async () => {
        await SubmitCheckService.go(session.id)

        const actualContact = CreateCompanyContactService.go.args[0][1]

        expect(actualContact.abstractionAlerts).to.be.true()
      })
    })

    describe('and "abstractionAlerts" is "no"', () => {
      beforeEach(async () => {
        sessionData = {
          company,
          name: 'Eric',
          email: 'eric@test.com',
          abstractionAlerts: 'no'
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('persists the "abstractionAlerts" as "false', async () => {
        await SubmitCheckService.go(session.id)

        const actualContact = CreateCompanyContactService.go.args[0][1]

        expect(actualContact.abstractionAlerts).to.be.false()
      })
    })
  })
})
