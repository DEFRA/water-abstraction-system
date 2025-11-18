'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')

// Things we need to stub
const FetchLicenceBillsService = require('../../../app/services/licences/fetch-licence-bills.service.js')

// Thing under test
const ViewLicenceBillsService = require('../../../app/services/licences/view-licence-bills.service.js')

describe('View Licence service bills', () => {
  let auth
  let licenceId
  let licenceRef

  beforeEach(() => {
    auth = {
      credentials: {
        roles: [
          {
            role: 'billing'
          }
        ]
      }
    }

    licenceId = generateUUID()
    licenceRef = generateLicenceRef()

    Sinon.stub(FetchLicenceBillsService, 'go').returns({
      bills: [],
      licence: {
        id: licenceId,
        licenceRef
      },
      pagination: { total: 1 }
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a bill', () => {
    describe('and it has no optional fields', () => {
      it('will return all the mandatory data and default values for use in the licence bills page', async () => {
        const result = await ViewLicenceBillsService.go(licenceId, auth)

        expect(result).to.equal({
          activeTab: 'bills',
          backLink: {
            href: '/licences',
            text: 'Go back to search'
          },
          bills: [],
          pageTitle: 'Bills',
          pageTitleCaption: `Licence ${licenceRef}`,
          pagination: { numberOfPages: 1 },
          roles: ['billing']
        })
      })
    })
  })
})
