'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things to stub
const FetchCompanyContactService = require('../../../../app/services/import/legacy/fetch-company-contacts.service.js')

// Thing under test
const TransformCompanyContactsService = require('../../../../app/services/import/legacy/transform-company-contacts.service.js')

describe('Import Legacy Transform Companies contact service', () => {
  // NOTE: Clearly this is an incomplete representation of the company returned from TransformedCompaniesService.
  // But for the purposes of this service it is all that is needed
  const transformedCompany = { externalId: '1:007' }

  const naldLicenceId = '2113'
  const regionCode = '1'

  let legacyContact
  let transformedCompanies

  beforeEach(() => {
    transformedCompanies = [{ ...transformedCompany }]

    legacyContact = _legacyContact()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when matching valid legacy companies contact is found', () => {
    beforeEach(() => {
      Sinon.stub(FetchCompanyContactService, 'go').resolves([legacyContact])
    })

    it('attaches the record transformed and validated for WRLS to the transformed company', async () => {
      await TransformCompanyContactsService.go(regionCode, naldLicenceId, transformedCompanies)

      expect(transformedCompanies[0]).to.equal({
        contact: {
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

  describe('when no matching valid legacy companies are found', () => {
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
    firstName: 'James',
    lastName: 'Bond',
    external_id: '1:007'
  }
}
