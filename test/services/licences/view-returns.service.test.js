'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')

// Things we need to stub
const DetermineLicenceHasReturnVersionsService = require('../../../app/services/licences/determine-licence-has-return-versions.service.js')
const FetchReturnsService = require('../../../app/services/licences/fetch-returns.service.js')
const FetchLicenceService = require('../../../app/services/licences/fetch-licence.service.js')

// Thing under test
const ViewReturnsService = require('../../../app/services/licences/view-returns.service.js')

describe('Licences - View Returns service', () => {
  const page = 1

  let auth
  let licence

  beforeEach(async () => {
    auth = {
      isValid: true,
      credentials: {
        user: { id: 123 },
        roles: [
          {
            role: 'returns'
          }
        ],
        groups: [],
        scope: ['returns'],
        permissions: { abstractionReform: false, billRuns: true, manage: true }
      }
    }

    licence = {
      licenceRef: generateLicenceRef()
    }

    Sinon.stub(DetermineLicenceHasReturnVersionsService, 'go').returns(true)

    Sinon.stub(FetchLicenceService, 'go').resolves(licence)

    Sinon.stub(FetchReturnsService, 'go').resolves({
      pagination: { total: 1 },
      returns: []
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a return', () => {
    describe('and it has no optional fields', () => {
      it('will return all the mandatory data and default values for use in the licence returns page', async () => {
        const result = await ViewReturnsService.go(licence.id, auth, page)

        expect(result).to.equal({
          activeNavBar: 'search',
          activeSecondaryNav: 'returns',
          backLink: {
            text: 'Go back to search',
            href: '/licences'
          },
          noReturnsMessage: 'No returns for this licence.',
          pageTitle: 'Returns',
          pageTitleCaption: `Licence ${licence.licenceRef}`,
          pagination: { numberOfPages: 1 },
          returns: [],
          roles: ['returns']
        })
      })
    })
  })
})
