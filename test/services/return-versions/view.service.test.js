'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ContactModel = require('../../../app/models/contact.model.js')
const LicenceModel = require('../../../app/models/licence.model.js')
const ReturnVersionModel = require('../../../app/models/return-version.model.js')

// Things we want to stub
const FetchReturnVersionService = require('../../../app/services/return-versions/fetch-return-version.service.js')

// Thing under test
const ViewService = require('../../../app/services/return-versions/view.service.js')

describe('Return Versions - View service', () => {
  const returnVersionId = '0c6ed18f-39fb-4d70-93bb-cf24453dbb70'

  beforeEach(async () => {
    Sinon.stub(FetchReturnVersionService, 'go').resolves(_returnVersion())
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewService.go(returnVersionId)

      expect(result).to.equal({
        activeNavBar: 'search',
        createdBy: 'carol.shaw@atari.com',
        createdDate: '5 April 2022',
        licenceId: '761bc44f-80d5-49ae-ab46-0a90495417b5',
        licenceRef: '01/123',
        multipleUpload: 'No',
        notes: ['A special note'],
        pageTitle: 'Requirements for returns for Mrs A J Easley',
        quarterlyReturnSubmissions: false,
        quarterlyReturns: 'No',
        reason: 'New licence',
        requirements: [
          {
            abstractionPeriod: 'From 1 April to 31 October',
            agreementsExceptions: 'None',
            frequencyCollected: 'monthly',
            frequencyReported: 'monthly',
            points: ['At National Grid Reference SE 4044 7262 (Borehole in top field)'],
            purposes: [
              'Spray Irrigation - Direct'
            ],
            returnReference: 10012345,
            returnsCycle: 'Winter and all year',
            siteDescription: 'Borehole in field',
            title: 'Borehole in field'
          }
        ],
        startDate: '1 April 2022',
        status: 'current'
      })
    })
  })
})

function _returnVersion () {
  const contact = ContactModel.fromJson({
    firstName: 'Annie',
    middleInitials: 'J',
    lastName: 'Easley',
    salutation: 'Mrs'
  })

  const licence = LicenceModel.fromJson({
    id: '761bc44f-80d5-49ae-ab46-0a90495417b5',
    licenceRef: '01/123',
    licenceDocument: {
      licenceDocumentRoles: [{
        id: '3b903973-2143-47fe-b7a2-b205aa8eb933',
        contact
      }]
    }
  })

  const returnVersionData = {
    createdAt: new Date('2022-04-05'),
    id: '3f09ce0b-288c-4c0b-b519-7329fe70a6cc',
    multipleUpload: false,
    notes: 'A special note',
    reason: 'new-licence',
    startDate: new Date('2022-04-01'),
    status: 'current',
    modLogs: [],
    user: { id: 1, username: 'carol.shaw@atari.com' },
    licence,
    returnRequirements: [{
      abstractionPeriodEndDay: 31,
      abstractionPeriodEndMonth: 10,
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 4,
      collectionFrequency: 'month',
      fiftySixException: false,
      gravityFill: false,
      id: 'fa0c6032-7031-4aa2-be95-4a2edf1753ac',
      legacyId: 10012345,
      reabstraction: false,
      reportingFrequency: 'month',
      siteDescription: 'Borehole in field',
      summer: false,
      twoPartTariff: false,
      points: [{
        description: 'Borehole in top field',
        id: 'd03d7d7c-4e33-4b4d-ac9b-6ebac9a5e5f6',
        ngr1: 'SE 4044 7262',
        ngr2: null,
        ngr3: null,
        ngr4: null
      }],
      returnRequirementPurposes: [{
        alias: null,
        id: '7a2e3a5a-b10d-4a0f-b115-42b7551c4e8c',
        purpose: { description: 'Spray Irrigation - Direct', id: 'e0bd8bd4-cfb8-44ba-b76b-2b722fcc2207' }
      }]
    }]
  }

  return ReturnVersionModel.fromJson(returnVersionData)
}
