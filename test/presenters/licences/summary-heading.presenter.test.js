'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceModel = require('../../../app/models/licence.model.js')
const ViewLicencesFixture = require('../../fixtures/view-licences.fixture.js')

// Thing under test
const SummaryHeadingPresenter = require('../../../app/presenters/licences/summary-heading.presenter.js')

describe('Licences - Summary Heading presenter', () => {
  let licence
  let summary

  beforeEach(() => {
    licence = ViewLicencesFixture.licence()
    summary = _summary()
  })

  describe('when provided with a populated licence', () => {
    it('correctly presents the data', () => {
      const result = SummaryHeadingPresenter.go(licence, summary)

      expect(result).to.equal({
        backLink: {
          href: '/licences',
          text: 'Go back to search'
        },
        currentVersion: 'The current version of the licence starting 1 April 2019',
        licenceRef: licence.licenceRef,
        notification: {
          text: 'This licence has been marked for the next two-part tariff supplementary bill run.',
          titleText: 'Important'
        },
        pageTitle: `Licence summary ${licence.licenceRef}`,
        pageTitleCaption: 'Between two ferns',
        primaryUser: {
          id: 10036,
          username: 'grace.hopper@example.co.uk'
        },
        warning: null,
        workflowWarning: true
      })
    })
  })

  describe('the "currentVersion" property', () => {
    describe('when the current version is null', () => {
      it('returns the text with the "startDate"', () => {
        const result = SummaryHeadingPresenter.go(licence, summary)

        expect(result.currentVersion).to.equal('The current version of the licence starting 1 April 2019')
      })
    })

    describe('when the current version is not null', () => {
      beforeEach(() => {
        summary.licenceVersions = [
          {
            startDate: new Date('2021-01-01')
          }
        ]
      })

      it('returns the text with the licence versions "startDate"', () => {
        const result = SummaryHeadingPresenter.go(licence, summary)

        expect(result.currentVersion).to.equal('The current version of the licence starting 1 January 2021')
      })
    })
  })

  describe('the "pageTitleCaption" property', () => {
    describe('when the licence has a primary user (registered user)', () => {
      describe('and they have added a custom name for the licence', () => {
        it('returns the licence name', () => {
          const result = SummaryHeadingPresenter.go(licence, summary)

          expect(result.pageTitleCaption).to.equal('Between two ferns')
        })
      })

      describe('but they have not added a custom name for the licence', () => {
        beforeEach(() => {
          summary.licenceDocumentHeader.licenceName = null
        })

        it('returns null', () => {
          const result = SummaryHeadingPresenter.go(licence, summary)

          expect(result.pageTitleCaption).to.be.null()
        })
      })
    })

    describe('when the licence does not have a primary user (registered user)', () => {
      beforeEach(() => {
        summary.licenceDocumentHeader.licenceEntityRoles = []
      })

      it('returns "Unregistered licence"', () => {
        const result = SummaryHeadingPresenter.go(licence, summary)

        expect(result.pageTitleCaption).to.equal('Unregistered licence')
      })
    })
  })

  describe('the "warning" property', () => {
    describe('when the licence does not have an "end" date', () => {
      it('returns null', () => {
        const result = SummaryHeadingPresenter.go(licence, summary)

        expect(result.warning).to.be.null()
      })
    })

    describe('when the licence does have an "end" date', () => {
      describe('but it is in the future', () => {
        beforeEach(() => {
          licence.expiredDate = new Date('2099-04-01')
        })

        it('returns null', () => {
          const result = SummaryHeadingPresenter.go(licence, summary)

          expect(result.warning).to.be.null()
        })
      })

      describe('because it expired in the past', () => {
        beforeEach(() => {
          licence.expiredDate = new Date('2019-04-01')
        })

        it('returns "This licence expired on 1 April 2019"', () => {
          const result = SummaryHeadingPresenter.go(licence, summary)

          expect(result.warning).to.equal({
            iconFallbackText: 'Warning',
            text: 'This licence expired on 1 April 2019'
          })
        })
      })

      describe('because it lapsed in the past', () => {
        beforeEach(() => {
          licence.lapsedDate = new Date('2019-04-01')
        })

        it('returns "This licence lapsed on 1 April 2019"', () => {
          const result = SummaryHeadingPresenter.go(licence, summary)

          expect(result.warning).to.equal({
            iconFallbackText: 'Warning',
            text: 'This licence lapsed on 1 April 2019'
          })
        })
      })

      describe('because it was revoked in the past', () => {
        beforeEach(() => {
          licence.revokedDate = new Date('2019-04-01')
        })

        it('returns "This licence was revoked on 1 April 2019"', () => {
          const result = SummaryHeadingPresenter.go(licence, summary)

          expect(result.warning).to.equal({
            iconFallbackText: 'Warning',
            text: 'This licence was revoked on 1 April 2019'
          })
        })
      })
    })
  })

  describe('the "workflowWarning" property', () => {
    describe('when the licence is not in workflow', () => {
      beforeEach(() => {
        summary.workflows = []
      })

      it('returns false', () => {
        const result = SummaryHeadingPresenter.go(licence, summary)

        expect(result.workflowWarning).to.be.false()
      })
    })

    describe('when the licence is in workflow', () => {
      describe('but the status is not "to_setup"', () => {
        beforeEach(() => {
          summary.workflows[0].status = 'changes_requested'
        })

        it('returns false', () => {
          const result = SummaryHeadingPresenter.go(licence, summary)

          expect(result.workflowWarning).to.be.false()
        })
      })

      describe('and the status is "to_setup"', () => {
        it('returns true', () => {
          const result = SummaryHeadingPresenter.go(licence, summary)

          expect(result.workflowWarning).to.be.true()
        })
      })
    })
  })
})

function _summary() {
  return LicenceModel.fromJson({
    id: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
    expiredDate: null,
    licenceDocumentHeader: {
      id: 'e8f491f0-0c60-4083-9d41-d2be69f17a1e',
      licenceName: 'Between two ferns',
      licenceEntityRoles: [
        {
          id: 'd7eecfc1-7afa-49f7-8bef-5dc477696a2d',
          licenceEntity: {
            id: 'ba7702cf-cd87-4419-a04c-8cea4e0cfdc2',
            user: {
              id: 10036,
              username: 'grace.hopper@example.co.uk'
            }
          }
        }
      ]
    },
    licenceSupplementaryYears: [],
    startDate: new Date('2019-04-01'),
    workflows: [{ id: 'b6f44c94-25e4-4ca8-a7db-364534157ba7', status: 'to_setup' }]
  })
}
