'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Things to stub
const FetchCompanyContactService = require('../../../../app/services/import/legacy/fetch-contacts.service.js')

// Thing under test
const TransformCompanyContactsService = require('../../../../app/services/import/legacy/transform-contacts.service.js')

describe('Import Legacy Transform Contact service', () => {
  const naldLicenceId = '2113'
  const regionCode = '1'
  const licenceRoleId = generateUUID()

  let legacyContact
  let legacyContactWithCompanyContacts
  let transformedCompanies

  beforeEach(() => {
    transformedCompanies = [{ externalId: '1:007' }, { externalId: '1:009' }]

    legacyContact = _legacyContact()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when matching valid legacy contact is found', () => {
    beforeEach(() => {
      legacyContactWithCompanyContacts = { ..._legacyContact(), external_id: '1:009', start_date: '2020-01-01', licence_role_id: licenceRoleId }

      Sinon.stub(FetchCompanyContactService, 'go').resolves([legacyContact, legacyContactWithCompanyContacts])
    })

    it('attaches the record transformed and validated for WRLS to the transformed company', async () => {
      await TransformCompanyContactsService.go(regionCode, naldLicenceId, transformedCompanies)

      expect(transformedCompanies[0]).to.equal({
        contact: {
          dataSource: 'nald',
          externalId: '1:007',
          firstName: 'James',
          initials: 'H',
          lastName: 'Bond',
          salutation: 'Mr'
        },
        externalId: '1:007'
      })
    })

    describe('and there is a company contact', () => {
      it('attaches the company contact transformed for WRLS to the transformed company', async () => {
        await TransformCompanyContactsService.go(regionCode, naldLicenceId, transformedCompanies)

        expect(transformedCompanies[1]).to.equal({
          companyContact: {
            externalId: '1:009',
            licenceRoleId,
            startDate: '2020-01-01'
          },
          contact: {
            dataSource: 'nald',
            externalId: '1:009',
            firstName: 'James',
            initials: 'H',
            lastName: 'Bond',
            salutation: 'Mr'
          },
          externalId: '1:009'
        })
      })
    })
  })

  describe('when no matching valid legacy contact is found', () => {
    beforeEach(() => {
      Sinon.stub(FetchCompanyContactService, 'go').resolves([])
    })

    it('returns no contact object on the company', async () => {
      await TransformCompanyContactsService.go(regionCode, naldLicenceId, transformedCompanies)

      expect(transformedCompanies[0]).to.equal({ externalId: '1:007' })
    })
  })
})

function _legacyContact () {
  return {
    salutation: 'Mr',
    initials: 'H',
    first_name: 'James',
    last_name: 'Bond',
    external_id: '1:007'
  }
}
