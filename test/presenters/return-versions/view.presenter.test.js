'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ContactModel = require('../../../app/models/contact.model.js')
const LicenceModel = require('../../../app/models/licence.model.js')
const PointModel = require('../../../app/models/point.model.js')
const ReturnVersionModel = require('../../../app/models/return-version.model.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const ViewPresenter = require('../../../app/presenters/return-versions/view.presenter.js')

describe('Return Versions - View presenter', () => {
  let returnVersion

  beforeEach(() => {
    returnVersion = _returnVersion()
  })

  it('correctly presents the data', () => {
    const result = ViewPresenter.go(returnVersion)

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

  describe('the "multipleUpload" property', () => {
    describe('when multipleUpload is true', () => {
      beforeEach(() => {
        returnVersion.multipleUpload = true
      })

      it('returns "Yes"', () => {
        const result = ViewPresenter.go(returnVersion)

        expect(result.multipleUpload).to.equal('Yes')
      })
    })

    describe('when multipleUpload is false', () => {
      it('returns "No"', () => {
        const result = ViewPresenter.go(returnVersion)

        expect(result.multipleUpload).to.equal('No')
      })
    })
  })

  describe('the "pageTitle" property', () => {
    it("returns the title incorporating the licence holder's name", () => {
      const result = ViewPresenter.go(returnVersion)

      expect(result.pageTitle).to.equal('Requirements for returns for Mrs A J Easley')
    })
  })

  describe('the "quarterlyReturns" property', () => {
    describe('when quarterlyReturns is true', () => {
      beforeEach(() => {
        returnVersion.quarterlyReturns = true
      })

      it('returns "Yes"', () => {
        const result = ViewPresenter.go(returnVersion)

        expect(result.quarterlyReturns).to.equal('Yes')
      })
    })

    describe('when quarterlyReturns is false', () => {
      it('returns "No"', () => {
        const result = ViewPresenter.go(returnVersion)

        expect(result.quarterlyReturns).to.equal('No')
      })
    })
  })

  describe('the "quarterlyReturnSubmissions" property', () => {
    describe('when return version start date is for quarterly return submissions', () => {
      beforeEach(() => {
        returnVersion.startDate = new Date('2025-04-01')
      })

      it('returns true', () => {
        const result = ViewPresenter.go(returnVersion)

        expect(result.quarterlyReturnSubmissions).to.be.true()
      })
    })

    describe('when return version start date is not for quarterly return submissions', () => {
      it('returns false', () => {
        const result = ViewPresenter.go(returnVersion)

        expect(result.quarterlyReturnSubmissions).to.be.false()
      })
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
          returnVersion.modLogs = [
            {
              naldDate: new Date('2019-03-01'),
              note: null,
              reasonDescription: 'Record loaded during migration',
              userId: 'TTESTER'
            }
          ]
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
      describe('when the abstraction period has been set', () => {
        it('formats the abstraction period for display', () => {
          const result = ViewPresenter.go(returnVersion)

          const { abstractionPeriod } = result.requirements[0]

          expect(abstractionPeriod).to.equal('1 April to 31 October')
        })
      })

      describe('when the abstraction period has not been set', () => {
        beforeEach(() => {
          returnVersion.returnRequirements[0].abstractionPeriodEndDay = null
          returnVersion.returnRequirements[0].abstractionPeriodEndMonth = null
          returnVersion.returnRequirements[0].abstractionPeriodStartDay = null
          returnVersion.returnRequirements[0].abstractionPeriodStartMonth = null
        })

        it('returns an empty string', () => {
          const result = ViewPresenter.go(returnVersion)

          expect(result.requirements[0].abstractionPeriod).to.equal('')
        })
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

          expect(agreementsExceptions).to.equal(
            'Gravity fill, Transfer re-abstraction scheme, Two-part tariff, and 56 returns exception'
          )
        })
      })
    })

    describe('the requirements "points" property', () => {
      // Formatting of the points is handled by PointModel.$describe() so testing is light here
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

    describe('the requirements "siteDescription" property', () => {
      describe('when there is a site description', () => {
        it('returns the site description', () => {
          const result = ViewPresenter.go(returnVersion)

          const { siteDescription } = result.requirements[0]

          expect(siteDescription).to.equal('Borehole in field')
        })
      })

      describe('when there is no site description', () => {
        beforeEach(() => {
          returnVersion.returnRequirements[0].siteDescription = null
        })

        it('returns an empty string', () => {
          const result = ViewPresenter.go(returnVersion)

          const { siteDescription } = result.requirements[0]

          expect(siteDescription).to.equal('')
        })
      })
    })

    describe('the requirements "title" property', () => {
      describe('when there is a site description', () => {
        it('returns the site description as the title', () => {
          const result = ViewPresenter.go(returnVersion)

          const { title } = result.requirements[0]

          expect(title).to.equal('Borehole in field')
        })
      })

      describe('when there is no site description', () => {
        beforeEach(() => {
          returnVersion.returnRequirements[0].siteDescription = null
        })

        it('returns an empty string as the title', () => {
          const result = ViewPresenter.go(returnVersion)

          const { title } = result.requirements[0]

          expect(title).to.equal('')
        })
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
    id: generateUUID(),
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

  const point = PointModel.fromJson({
    description: 'Borehole in top field',
    id: generateUUID(),
    ngr1: 'SE 4044 7262',
    ngr2: null,
    ngr3: null,
    ngr4: null
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
        points: [point],
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
