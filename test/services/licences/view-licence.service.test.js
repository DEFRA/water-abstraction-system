'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = Code

// Test helpers
const LicenceModel = require('../../../app/models/licence.model.js')

// Things we need to stub
const FetchLicenceService = require('../../../app/services/licences/fetch-licence.service.js')

// Thing under test
const ViewLicenceService = require('../../../app/services/licences/view-licence.service.js')

describe('View Licence service', () => {
  let auth
  let licence

  beforeEach(() => {
    auth = _auth()
    licence = _licence()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a licence with a matching ID exists', () => {
    beforeEach(() => {
      Sinon.stub(FetchLicenceService, 'go').resolves(licence)
    })

    it('returns page data for the view', async () => {
      const result = await ViewLicenceService.go(licence.id, auth)

      expect(result).to.equal({
        activeNavBar: 'search',
        documentId: 'e8f491f0-0c60-4083-9d41-d2be69f17a1e',
        licenceId: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
        ends: null,
        includeInPresrocBilling: 'no',
        licenceName: 'Between two ferns',
        licenceRef: '01/123',
        notification: null,
        pageTitle: 'Licence 01/123',
        primaryUser: {
          id: 10036,
          username: 'grace.hopper@example.co.uk'
        },
        roles: ['billing', 'view_charge_versions'],
        warning: null,
        workflowWarning: true
      })
    })
  })

  describe('when a licence with a matching ID does not exist', () => {
    it('throws an exception', async () => {
      await expect(ViewLicenceService.go('a45341d0-82c7-4a00-975c-e978a6f776eb', auth))
        .to
        .reject()
    })
  })
})

function _auth () {
  return {
    credentials: {
      roles: [
        {
          id: 'b62afe79-d599-4101-b374-729011711462',
          role: 'billing',
          description: 'Administer billing',
          createdAt: new Date('2023-12-14'),
          updatedAt: new Date('2024-08-19')
        },
        {
          id: '02b09477-8c1e-4f9a-956c-ad18f9d4f222',
          role: 'view_charge_versions',
          description: 'View charge information',
          createdAt: new Date('2023-12-14'),
          updatedAt: new Date('2024-08-19')
        }
      ]
    }
  }
}

function _licence () {
  const licence = LicenceModel.fromJson({
    id: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
    expiredDate: null,
    lapsedDate: null,
    includeInPresrocBilling: 'no',
    includeInSrocBilling: false,
    licenceRef: '01/123',
    revokedDate: null,
    licenceDocumentHeader: {
      id: 'e8f491f0-0c60-4083-9d41-d2be69f17a1e',
      licenceName: 'Between two ferns',
      licenceEntityRole: {
        id: 'd7eecfc1-7afa-49f7-8bef-5dc477696a2d',
        licenceEntity: {
          id: 'ba7702cf-cd87-4419-a04c-8cea4e0cfdc2',
          user: {
            id: 10036,
            username: 'grace.hopper@example.co.uk'
          }
        }
      }
    },
    licenceSupplementaryYears: [],
    workflows: [{ id: 'b6f44c94-25e4-4ca8-a7db-364534157ba7', status: 'to_setup' }]
  })

  return licence
}
