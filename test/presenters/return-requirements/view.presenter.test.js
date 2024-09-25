'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ContactModel = require('../../../app/models/contact.model.js')
const LicenceModel = require('../../../app/models/licence.model.js')
const PointModel = require('../../../app/models/point.model.js')
const ReturnVersionModel = require('../../../app/models/return-version.model.js')

// Thing under test
const ViewPresenter = require('../../../app/presenters/return-requirements/view.presenter.js')

describe('Return Requirements - View presenter', () => {
  let returnVersion

  beforeEach(() => {
    returnVersion = _returnVersion()
  })

  it('correctly presents the data', () => {
    const result = ViewPresenter.go(returnVersion)

    expect(result).to.equal({
      additionalSubmissionOptions: {
        multipleUpload: 'No'
      },
      createdBy: 'carol.shaw@atari.com',
      createdDate: '5 April 2022',
      licenceId: '761bc44f-80d5-49ae-ab46-0a90495417b5',
      licenceRef: '01/123',
      notes: ['A special note'],
      pageTitle: 'Requirements for returns for Mrs A J Easley',
      reason: 'New licence',
      requirements: [
        {
          abstractionPeriod: 'From 1 April to 31 October',
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

  describe('the "additionalSubmissionOptions" property', () => {
    describe('when multipleUpload is true', () => {
      beforeEach(() => {
        returnVersion.multipleUpload = true
      })

      it('returns "Yes"', () => {
        const result = ViewPresenter.go(returnVersion)

        expect(result.additionalSubmissionOptions.multipleUpload).to.equal('Yes')
      })
    })

    describe('when multipleUpload is false', () => {
      it('returns "No"', () => {
        const result = ViewPresenter.go(returnVersion)

        expect(result.additionalSubmissionOptions.multipleUpload).to.equal('No')
      })
    })
  })

  describe('the "createdBy" property', () => {
    describe('when there is no user linked to the return', () => {
      beforeEach(() => {
        returnVersion.user = null
      })

      it('returns "Migrated from NALD" ', () => {
        const result = ViewPresenter.go(returnVersion)

        expect(result.createdBy).to.equal('Migrated from NALD')
      })
    })

    describe('when there is a user linked to the return', () => {
      it("returns the user's username", () => {
        const result = ViewPresenter.go(returnVersion)

        expect(result.createdBy).to.equal('carol.shaw@atari.com')
      })
    })
  })

  describe('the "createdDate" property', () => {
    it('returns created date', () => {
      const result = ViewPresenter.go(returnVersion)

      expect(result.createdDate).to.equal('5 April 2022')
    })
  })

  describe('the "pageTitle" property', () => {
    it("returns the title incorporating the licence holder's name", () => {
      const result = ViewPresenter.go(returnVersion)

      expect(result.pageTitle).to.equal('Requirements for returns for Mrs A J Easley')
    })
  })

  describe('the "reason" property', () => {
    describe('when there is a reason', () => {
      it('returns the formatted reason', () => {
        const result = ViewPresenter.go(returnVersion)

        expect(result.reason).to.equal('New licence')
      })
    })

    describe('when there is no reason', () => {
      beforeEach(() => {
        returnVersion.reason = null
      })

      describe('and no mod log entries', () => {
        it('returns an empty string', () => {
          const result = ViewPresenter.go(returnVersion)

          expect(result.reason).to.equal('')
        })
      })

      describe('but there is a mod log entry with a reason', () => {
        beforeEach(() => {
          returnVersion.modLogs = [{
            naldDate: new Date('2019-03-01'),
            note: null,
            reasonDescription: 'Record loaded during migration',
            userId: 'TTESTER'
          }]
        })

        it('returns reason from the mod log', () => {
          const result = ViewPresenter.go(returnVersion)

          expect(result.reason).to.equal('Record loaded during migration')
        })
      })
    })
  })

  describe('the "requirements" property', () => {
    describe('the requirements "abstractionPeriod" property', () => {
      it('formats the abstraction period for display', () => {
        const result = ViewPresenter.go(returnVersion)

        const { abstractionPeriod } = result.requirements[0]

        expect(abstractionPeriod).to.equal('From 1 April to 31 October')
      })
    })

    describe('the requirements "agreementsExceptions" property', () => {
      describe('when no agreements or exceptions have been applied', () => {
        it('returns "None"', () => {
          const result = ViewPresenter.go(returnVersion)

          const { agreementsExceptions } = result.requirements[0]

          expect(agreementsExceptions).to.equal('None')
        })
      })

      describe('when one agreement or exception was applied', () => {
        beforeEach(() => {
          returnVersion.returnRequirements[0].gravityFill = true
        })

        it("returns it's display text (Gravity fill)", () => {
          const result = ViewPresenter.go(returnVersion)

          const { agreementsExceptions } = result.requirements[0]

          expect(agreementsExceptions).to.equal('Gravity fill')
        })
      })

      describe('when two agreements or exceptions were selected', () => {
        beforeEach(() => {
          returnVersion.returnRequirements[0].gravityFill = true
          returnVersion.returnRequirements[0].reabstraction = true
        })

        it('returns them joined with an "and" (Gravity fill and Transfer re-abstraction scheme)', () => {
          const result = ViewPresenter.go(returnVersion)

          const { agreementsExceptions } = result.requirements[0]

          expect(agreementsExceptions).to.equal('Gravity fill and Transfer re-abstraction scheme')
        })
      })

      describe('when more than two options were selected', () => {
        beforeEach(() => {
          returnVersion.returnRequirements[0].fiftySixException = true
          returnVersion.returnRequirements[0].gravityFill = true
          returnVersion.returnRequirements[0].reabstraction = true
          returnVersion.returnRequirements[0].twoPartTariff = true
        })

        it('returns them joined with an ", and" (Gravity fill, Transfer re-abstraction scheme, Two-part tariff, and 56 returns exception)', () => {
          const result = ViewPresenter.go(returnVersion)

          const { agreementsExceptions } = result.requirements[0]

          expect(agreementsExceptions).to.equal('Gravity fill, Transfer re-abstraction scheme, Two-part tariff, and 56 returns exception')
        })
      })
    })

    describe('the requirements "points" property', () => {
      // Formatting of the points uses GeneralLib.generateAbstractionPointDetail() so testing is 'light' here
      it('formats the points for display', () => {
        const result = ViewPresenter.go(returnVersion)

        const { points } = result.requirements[0]

        expect(points).to.equal(['At National Grid Reference SE 4044 7262 (Borehole in top field)'])
      })
    })

    describe('the requirements "purposes" property', () => {
      describe('when a purpose description (alias) was added to the purpose', () => {
        beforeEach(() => {
          returnVersion.returnRequirements[0].returnRequirementPurposes[0].alias = 'spray indiscreetly'
        })

        it('formats the purposes for display with the purpose description in brackets', () => {
          const result = ViewPresenter.go(returnVersion)

          const { purposes } = result.requirements[0]

          expect(purposes).to.equal(['Spray Irrigation - Direct (spray indiscreetly)'])
        })
      })

      describe('when a purpose description (alias) was not added to the purpose', () => {
        it('formats the purposes for display with just the default description', () => {
          const result = ViewPresenter.go(returnVersion)

          const { purposes } = result.requirements[0]

          expect(purposes).to.equal(['Spray Irrigation - Direct'])
        })
      })
    })

    describe('the requirements "returnsCycle" property', () => {
      describe('when the requirement is for the "summer" returns cycle', () => {
        beforeEach(() => {
          returnVersion.returnRequirements[0].summer = true
        })

        it('formats the cycle for display (Summer)', () => {
          const result = ViewPresenter.go(returnVersion)

          const { returnsCycle } = result.requirements[0]

          expect(returnsCycle).to.equal('Summer')
        })
      })

      describe('when the requirement is for the "winter-and-all-year" returns cycle', () => {
        it('formats the cycle for display (Winter and all year)', () => {
          const result = ViewPresenter.go(returnVersion)

          const { returnsCycle } = result.requirements[0]

          expect(returnsCycle).to.equal('Winter and all year')
        })
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

  const point = PointModel.fromJson({
    description: 'Borehole in top field',
    id: 'd03d7d7c-4e33-4b4d-ac9b-6ebac9a5e5f6',
    ngr1: 'SE 4044 7262',
    ngr2: null,
    ngr3: null,
    ngr4: null
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
      points: [point],
      returnRequirementPurposes: [{
        alias: null,
        id: '7a2e3a5a-b10d-4a0f-b115-42b7551c4e8c',
        purpose: { description: 'Spray Irrigation - Direct', id: 'e0bd8bd4-cfb8-44ba-b76b-2b722fcc2207' }
      }]
    }]
  }

  return ReturnVersionModel.fromJson(returnVersionData)
}
