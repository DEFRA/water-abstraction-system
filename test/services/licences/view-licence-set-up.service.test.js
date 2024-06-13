'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
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
    Sinon.stub(FetchAgreementsService, 'go').returns([
      {
        id: '123',
        startDate: new Date('2020-01-01'),
        endDate: null,
        dateSigned: null,
        financialAgreements: [{ financialAgreementCode: 'S127' }]
      }
    ])

    Sinon.stub(FetchChargeVersionsService, 'go').returns([
      {
        changeReason: { description: 'Missing thing' },
        endDate: new Date('2020-09-01'),
        id: '123',
        licenceId: '456',
        startDate: new Date('2020-01-01'),
        status: 'current'
      }
    ])

    Sinon.stub(FetchReturnVersionsService, 'go').returns([
      {
        id: '0312e5eb-67ae-44fb-922c-b1a0b81bc08d',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-02-01'),
        status: 'current',
        reason: 'change-to-special-agreement'
      }
    ])

    Sinon.stub(FetchWorkflowsService, 'go').returns([
      {
        id: '123',
        createdAt: new Date('2020-01-01'),
        status: 'review',
        data: { chargeVersion: { changeReason: { description: 'changed something' } } },
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
            dateSigned: '',
            description: 'Two-part tariff',
            endDate: '',
            startDate: '1 January 2020'
          }
        ],
        chargeInformation: [
          {
            action: [],
            endDate: '-',
            id: '123',
            reason: 'changed something',
            startDate: '1 January 2020',
            status: 'review'
          },
          {
            action: [
              {
                link: '/licences/456/charge-information/123/view',
                text: 'View'
              }
            ],
            endDate: '1 September 2020',
            id: '123',
            reason: 'Missing thing',
            startDate: '1 January 2020',
            status: 'approved'
          }
        ],
        licenceId: testId,
        licenceName: 'fake licence',
        links: {
          agreements: {},
          chargeInformation: {
            makeLicenceNonChargeable: '/licences/2c80bd22-a005-4cf4-a2a2-73812a9861de/charge-information/non-chargeable-reason?start=1',
            setupNewCharge: '/licences/2c80bd22-a005-4cf4-a2a2-73812a9861de/charge-information/create'
          },
          returnVersions: {}
        },
        returnVersions: [
          {
            action: [
              {
                link: '',
                text: 'View'
              }
            ],
            endDate: '1 February 2025',
            reason: 'Change to special agreement',
            startDate: '1 January 2025',
            status: 'approved'
          }
        ]
      })
    })
  })
})
