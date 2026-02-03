'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ContactModel = require('../../../app/models/contact.model.js')
const LicenceModel = require('../../../app/models/licence.model.js')
const ReturnVersionModel = require('../../../app/models/return-version.model.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Things we want to stub
const FetchReturnVersionService = require('../../../app/services/return-versions/fetch-return-version.service.js')

// Thing under test
const ViewService = require('../../../app/services/return-versions/view.service.js')

describe('Return Versions - View service', () => {
  const returnVersionId = generateUUID()

  let returnVersion

  beforeEach(() => {
    returnVersion = _returnVersion()

    Sinon.stub(FetchReturnVersionService, 'go').resolves(returnVersion)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewService.go(returnVersionId)

      expect(result).to.equal({
        backLink: {
          href: `/system/licences/${returnVersion.licence.id}/set-up`,
          text: 'Go back to summary'
        },
        createdBy: 'carol.shaw@atari.com',
        createdDate: '5 April 2022',
        licenceId: returnVersion.licence.id,
        licenceRef: '01/123',
        multipleUpload: 'No',
        notes: ['A special note'],
        pageTitle: 'Requirements for returns for Mrs A J Easley',
        pageTitleCaption: 'Licence 01/123',
        quarterlyReturnSubmissions: false,
        quarterlyReturns: 'No',
        reason: 'New licence',
        requirements: [
          {
            abstractionPeriod: '1 April to 31 October',
            agreementsExceptions: 'None',
            frequencyCollected: 'monthly',
            frequencyReported: 'monthly',
            points: ['At National Grid Reference SE 4044 7262 (Borehole in top field)'],
            purposes: ['Spray Irrigation - Direct'],
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

function _returnVersion() {
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
      licenceDocumentRoles: [
        {
          id: generateUUID(),
          contact
        }
      ]
    }
  })

  const returnVersionData = {
    createdAt: new Date('2022-04-05'),
    id: generateUUID(),
    multipleUpload: false,
    notes: 'A special note',
    reason: 'new-licence',
    startDate: new Date('2022-04-01'),
    status: 'current',
    modLogs: [],
    user: { id: 1, username: 'carol.shaw@atari.com' },
    licence,
    returnRequirements: [
      {
        abstractionPeriodEndDay: 31,
        abstractionPeriodEndMonth: 10,
        abstractionPeriodStartDay: 1,
        abstractionPeriodStartMonth: 4,
        collectionFrequency: 'month',
        fiftySixException: false,
        gravityFill: false,
        id: generateUUID(),
        legacyId: 10012345,
        reabstraction: false,
        reportingFrequency: 'month',
        siteDescription: 'Borehole in field',
        summer: false,
        twoPartTariff: false,
        points: [
          {
            description: 'Borehole in top field',
            id: generateUUID(),
            ngr1: 'SE 4044 7262',
            ngr2: null,
            ngr3: null,
            ngr4: null
          }
        ],
        returnRequirementPurposes: [
          {
            alias: null,
            id: generateUUID(),
            purpose: { description: 'Spray Irrigation - Direct', id: generateUUID() }
          }
        ]
      }
    ]
  }

  return ReturnVersionModel.fromJson(returnVersionData)
}
