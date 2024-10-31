'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = require('node:test')
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
  let transformedCompanies

  beforeEach(() => {
    transformedCompanies = [{ externalId: '1:007' }, { externalId: '1:009' }]

    legacyContact = _legacyContact(licenceRoleId)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when matching valid legacy contact is found', () => {
    beforeEach(() => {
      Sinon.stub(FetchCompanyContactService, 'go').resolves([legacyContact])
    })

    it('attaches the record transformed and validated for WRLS to the transformed company', async () => {
      await TransformCompanyContactsService.go(regionCode, naldLicenceId, transformedCompanies)

      expect(transformedCompanies[0]).to.equal({
        companyContact: {
          externalId: '1:007',
          licenceRoleId,
          startDate: '2020-01-01'
        },
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

function _legacyContact (licenceRoleId) {
  return {
    external_id: '1:007',
    first_name: 'James',
    initials: 'H',
    last_name: 'Bond',
    licence_role_id: licenceRoleId,
    salutation: 'Mr',
    start_date: '2020-01-01'
  }
}
