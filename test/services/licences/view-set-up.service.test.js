'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceModel = require('../../../app/models/licence.model.js')
const ReturnVersionModel = require('../../../app/models/return-version.model.js')
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Things we need to stub
const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')
const FetchAgreementsService = require('../../../app/services/licences/fetch-agreements.service.js')
const FetchChargeVersionsService = require('../../../app/services/licences/fetch-charge-versions.service.js')
const FetchLicenceService = require('../../../app/services/licences/fetch-licence.service.js')
const FetchReturnVersionsService = require('../../../app/services/licences/fetch-return-versions.service.js')
const FetchWorkflowsService = require('../../../app/services/licences/fetch-workflows.service.js')

// Thing under test
const ViewSetUpService = require('../../../app/services/licences/view-set-up.service.js')

describe('Licences - View Set Up service', () => {
  let agreement
  let auth
  let chargeVersion
  let licence
  let returnVersion
  let workflow

  beforeEach(() => {
    licence = LicenceModel.fromJson({
      id: generateUUID(),
      licenceRef: generateLicenceRef()
    })

    auth = {
      isValid: true,
      credentials: {
        user: { id: 123 },
        roles: [
          {
            role: 'billing'
          },
          {
            role: 'charge_version_workflow_editor'
          }
        ],
        groups: [],
        scope: ['billing', 'charge_version_workflow_editor'],
        permissions: { abstractionReform: false, billRuns: true, manage: true }
      }
    }

    agreement = {
      id: generateUUID(),
      startDate: new Date('2020-01-01'),
      endDate: null,
      signedOn: null,
      financialAgreement: { id: generateUUID(), code: 'S127' }
    }

    chargeVersion = {
      id: generateUUID(),
      startDate: new Date('2020-01-01'),
      endDate: new Date('2020-09-01'),
      status: 'current',
      changeReason: { description: 'Missing thing' },
      licenceId: licence.id
    }

    returnVersion = ReturnVersionModel.fromJson({
      id: generateUUID(),
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-02-01'),
      status: 'current',
      reason: 'change-to-special-agreement',
      modLogs: []
    })

    workflow = {
      id: generateUUID(),
      createdAt: new Date('2020-01-01'),
      status: 'review',
      data: {
        chargeVersion: {
          changeReason: { description: 'changed something' },
          dateRange: { startDate: '2022-04-01' }
        }
      },
      licenceId: licence.id
    }

    Sinon.stub(FeatureFlagsConfig, 'enableRequirementsForReturns').value(false)

    Sinon.stub(FetchAgreementsService, 'go').returns([agreement])

    Sinon.stub(FetchChargeVersionsService, 'go').returns([chargeVersion])

    Sinon.stub(FetchReturnVersionsService, 'go').returns([returnVersion])

    Sinon.stub(FetchWorkflowsService, 'go').returns([workflow])

    Sinon.stub(FetchLicenceService, 'go').resolves(licence)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewSetUpService.go(licence.id, auth)

      expect(result).to.equal({
        activeNavBar: 'search',
        activeSecondaryNav: 'set-up',
        backLink: {
          href: '/licences',
          text: 'Go back to search'
        },
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
            id: workflow.id,
            reason: 'changed something',
            startDate: '1 April 2022',
            status: 'review'
          },
          {
            action: [
              {
                dataTest: 'charge-version-0',
                link: `/licences/${licence.id}/charge-information/${chargeVersion.id}/view`,
                text: 'View'
              }
            ],
            endDate: '1 September 2020',
            id: chargeVersion.id,
            reason: 'Missing thing',
            startDate: '1 January 2020',
            status: 'current'
          }
        ],
        links: {
          agreements: {},
          chargeInformation: {
            makeLicenceNonChargeable: `/licences/${licence.id}/charge-information/non-chargeable-reason?start=1`,
            setupNewCharge: `/licences/${licence.id}/charge-information/create`
          },
          recalculateBills: {
            markForSupplementaryBilling: `/system/licences/${licence.id}/mark-for-supplementary-billing`
          },
          returnVersions: {}
        },
        pageTitle: 'Licence set up',
        pageTitleCaption: `Licence ${licence.licenceRef}`,
        returnVersions: [
          {
            action: [
              {
                dataTest: 'return-version-0',
                link: `/system/return-versions/${returnVersion.id}`,
                text: 'View'
              }
            ],
            endDate: '1 February 2025',
            reason: 'Change to special agreement',
            startDate: '1 January 2025',
            status: 'current'
          }
        ],
        roles: ['billing', 'charge_version_workflow_editor']
      })
    })
  })
})
