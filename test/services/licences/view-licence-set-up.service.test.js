'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Test helpers
const ReturnVersionModel = require('../../../app/models/return-version.model.js')

// Things we need to stub
const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')
const FetchAgreementsService = require('../../../app/services/licences/fetch-agreements.service.js')
const FetchChargeVersionsService = require('../../../app/services/licences/fetch-charge-versions.service.js')
const FetchReturnVersionsService = require('../../../app/services/licences/fetch-return-versions.service.js')
const FetchWorkflowsService = require('../../../app/services/licences/fetch-workflows.service.js')
const ViewLicenceService = require('../../../app/services/licences/view-licence.service.js')

// Thing under test
const ViewLicenceSetUpService = require('../../../app/services/licences/view-licence-set-up.service.js')

describe('View Licence Set Up service', () => {
  const testId = '2c80bd22-a005-4cf4-a2a2-73812a9861de'

  let auth = {}

  beforeEach(() => {
    Sinon.stub(FeatureFlagsConfig, 'enableRequirementsForReturns').value(false)
    Sinon.stub(FeatureFlagsConfig, 'enableTwoPartTariffSupplementary').value(false)

    Sinon.stub(FetchAgreementsService, 'go').returns([
      {
        id: 'ca41d547-2cb6-4995-8af4-90117839bf86',
        startDate: new Date('2020-01-01'),
        endDate: null,
        signedOn: null,
        financialAgreement: { id: 'f766a058-99e0-4cb3-8b63-53856dd60cf9', code: 'S127' }
      }
    ])

    Sinon.stub(FetchChargeVersionsService, 'go').returns([
      {
        changeReason: { description: 'Missing thing' },
        endDate: new Date('2020-09-01'),
        id: 'c0601335-b6ad-4651-b54b-c586f8d22ac3',
        licenceId: '456',
        startDate: new Date('2020-01-01'),
        status: 'current'
      }
    ])

    const returnVersion = ReturnVersionModel.fromJson({
      id: '0312e5eb-67ae-44fb-922c-b1a0b81bc08d',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-02-01'),
      status: 'current',
      reason: 'change-to-special-agreement',
      modLogs: []
    })

    Sinon.stub(FetchReturnVersionsService, 'go').returns([returnVersion])

    Sinon.stub(FetchWorkflowsService, 'go').returns([
      {
        id: 'f3fe1275-50ff-4f69-98cb-5a35c17654f3',
        createdAt: new Date('2020-01-01'),
        status: 'review',
        data: {
          chargeVersion: {
            changeReason: { description: 'changed something' },
            dateRange: { startDate: '2022-04-01' }
          }
        },
        licenceId: '456'
      }
    ])

    Sinon.stub(ViewLicenceService, 'go').resolves({
      licenceName: 'fake licence',
      licenceId: testId
    })

    auth = {
      isValid: true,
      credentials: {
        user: { id: 123 },
        roles: ['billing', 'charge_version_workflow_editor'],
        groups: [],
        scope: ['billing', 'charge_version_workflow_editor'],
        permissions: { abstractionReform: false, billRuns: true, manage: true }
      }
    }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewLicenceSetUpService.go(testId, auth)

      expect(result).to.equal({
        activeTab: 'set-up',
        agreements: [
          {
            action: [],
            signedOn: '',
            description: 'Two-part tariff',
            endDate: '',
            startDate: '1 January 2020'
          }
        ],
        chargeInformation: [
          {
            action: [],
            endDate: '',
            id: 'f3fe1275-50ff-4f69-98cb-5a35c17654f3',
            reason: 'changed something',
            startDate: '1 April 2022',
            status: 'review'
          },
          {
            action: [
              {
                link: '/licences/456/charge-information/c0601335-b6ad-4651-b54b-c586f8d22ac3/view',
                text: 'View'
              }
            ],
            endDate: '1 September 2020',
            id: 'c0601335-b6ad-4651-b54b-c586f8d22ac3',
            reason: 'Missing thing',
            startDate: '1 January 2020',
            status: 'current'
          }
        ],
        licenceId: testId,
        licenceName: 'fake licence',
        links: {
          agreements: {},
          chargeInformation: {
            makeLicenceNonChargeable:
              '/licences/2c80bd22-a005-4cf4-a2a2-73812a9861de/charge-information/non-chargeable-reason?start=1',
            setupNewCharge: '/licences/2c80bd22-a005-4cf4-a2a2-73812a9861de/charge-information/create'
          },
          recalculateBills: {},
          returnVersions: {}
        },
        returnVersions: [
          {
            action: [
              {
                link: '/system/return-versions/0312e5eb-67ae-44fb-922c-b1a0b81bc08d',
                text: 'View'
              }
            ],
            endDate: '1 February 2025',
            reason: 'Change to special agreement',
            startDate: '1 January 2025',
            status: 'current'
          }
        ]
      })
    })
  })
})
