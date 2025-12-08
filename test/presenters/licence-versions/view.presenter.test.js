'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceVersionModel = require('../../../app/models/licence-version.model.js')
const ViewLicencesFixture = require('../../fixtures/view-licences.fixture.js')
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const ViewPresenter = require('../../../app/presenters/licence-versions/view.presenter.js')

describe('Licence Versions - View presenter', () => {
  let auth
  let licence
  let licenceVersion
  let licenceVersionData

  beforeEach(() => {
    auth = {
      credentials: {
        scope: []
      }
    }

    licence = {
      id: generateUUID(),
      licenceRef: generateLicenceRef()
    }

    licenceVersion = LicenceVersionModel.fromJson({
      administrative: null,
      createdAt: new Date('2022-01-01'),
      id: generateUUID(),
      licence,
      licenceVersionPurposes: [],
      modLogs: [
        {
          id: generateUUID(),
          reasonDescription: 'Licence Holder Name/Address Change',
          userId: 'JOBSWORTH01',
          note: 'Whole licence trade'
        }
      ],
      startDate: new Date('2022-01-01')
    })

    licenceVersionData = {
      licenceVersion,
      licenceVersionsForPagination: [licenceVersion]
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ViewPresenter.go(licenceVersionData, auth)

      expect(result).to.equal({
        backLink: {
          href: `/system/licences/${licence.id}/history`,
          text: 'Go back to history'
        },
        changeType: 'licence issued',
        errorInDataEmail: 'water_abstractiondigital@environment-agency.gov.uk',
        notes: null,
        pageTitle: 'Licence version starting 1 January 2022',
        pageTitleCaption: `Licence ${licence.licenceRef}`,
        pagination: null,
        points: [],
        reason: 'Licence Holder Name/Address Change'
      })
    })
  })

  describe('the "errorInDataEmail" property', () => {
    describe('when the user does NOT have the "billing" role', () => {
      it('returns the email address', () => {
        const result = ViewPresenter.go(licenceVersionData, auth)

        expect(result.errorInDataEmail).to.equal('water_abstractiondigital@environment-agency.gov.uk')
      })
    })

    describe('when the user has the "billing" role', () => {
      beforeEach(() => {
        auth.credentials.scope = ['billing']
      })

      it('returns null', () => {
        const result = ViewPresenter.go(licenceVersionData, auth)

        expect(result.errorInDataEmail).to.be.null()
      })
    })
  })

  describe('the "changeType" property', () => {
    describe('when the licence version is not administrative', () => {
      it('returns "licence issued"', () => {
        const result = ViewPresenter.go(licenceVersionData, auth)

        expect(result.changeType).to.equal('licence issued')
      })
    })

    describe('when the licence version is administrative', () => {
      beforeEach(() => {
        licenceVersion.administrative = true
      })

      it('returns "no licence issued"', () => {
        const result = ViewPresenter.go(licenceVersionData, auth)

        expect(result.changeType).to.equal('no licence issued')
      })
    })
  })

  describe('the "notes" property', () => {
    describe('when the user does not have the "billing" role', () => {
      it('returns null', () => {
        const result = ViewPresenter.go(licenceVersionData, auth)

        expect(result.notes).to.be.null()
      })
    })

    describe('when the user has the "billing" role', () => {
      beforeEach(() => {
        auth.credentials.scope = ['billing']
      })

      describe('and there are notes', () => {
        it('returns the notes', () => {
          const result = ViewPresenter.go(licenceVersionData, auth)

          expect(result.notes).to.equal(['Whole licence trade'])
        })
      })

      describe('but there are no notes', () => {
        beforeEach(() => {
          licenceVersion.modLogs[0].note = null
        })

        it('returns null', () => {
          const result = ViewPresenter.go(licenceVersionData, auth)

          expect(result.notes).to.be.null()
        })
      })
    })
  })

  describe('the "pagination" property', () => {
    describe('when there is no "pagination" required', () => {
      it('returns null', () => {
        const result = ViewPresenter.go(licenceVersionData, auth)

        expect(result.pagination).to.be.null()
      })
    })

    describe('when there is "pagination"', () => {
      let previousLicenceVersion
      let nextLicenceVersion

      beforeEach(() => {
        previousLicenceVersion = {
          id: generateUUID(),
          startDate: new Date('2019-01-01')
        }

        nextLicenceVersion = {
          id: generateUUID(),
          startDate: new Date('2025-01-01')
        }
      })

      describe('and there are both "previous" and "next" licence versions', () => {
        beforeEach(() => {
          licenceVersionData.licenceVersionsForPagination = [previousLicenceVersion, licenceVersion, nextLicenceVersion]
        })

        it('returns the "previous" and "next" links', () => {
          const result = ViewPresenter.go(licenceVersionData, auth)

          expect(result.pagination).to.equal({
            next: {
              href: `/system/licence-versions/${nextLicenceVersion.id}`,
              labelText: 'Starting 1 January 2025',
              text: 'Next version'
            },
            previous: {
              href: `/system/licence-versions/${previousLicenceVersion.id}`,
              labelText: 'Starting 1 January 2019',
              text: 'Previous version'
            }
          })
        })
      })

      describe('and there is only a "next" licence version', () => {
        beforeEach(() => {
          licenceVersionData.licenceVersionsForPagination = [licenceVersion, nextLicenceVersion]
        })

        it('returns the "next" link', () => {
          const result = ViewPresenter.go(licenceVersionData, auth)

          expect(result.pagination).to.equal({
            next: {
              href: `/system/licence-versions/${nextLicenceVersion.id}`,
              labelText: 'Starting 1 January 2025',
              text: 'Next version'
            }
          })
        })
      })

      describe('and there is only a "previous" licence version', () => {
        beforeEach(() => {
          licenceVersionData.licenceVersionsForPagination = [previousLicenceVersion, licenceVersion]
        })

        it('returns the "previous" link', () => {
          const result = ViewPresenter.go(licenceVersionData, auth)

          expect(result.pagination).to.equal({
            previous: {
              href: `/system/licence-versions/${previousLicenceVersion.id}`,
              labelText: 'Starting 1 January 2019',
              text: 'Previous version'
            }
          })
        })
      })
    })
  })

  describe('the "points" property', () => {
    describe('when there are no points', () => {
      it('returns an empty array', () => {
        const result = ViewPresenter.go(licenceVersionData, auth)

        expect(result.points).to.equal([])
      })
    })

    describe('when there are points', () => {
      beforeEach(() => {
        licenceVersionData.licenceVersion.licenceVersionPurposes = [
          {
            points: [ViewLicencesFixture.point()]
          }
        ]
      })

      it('returns the points', () => {
        const result = ViewPresenter.go(licenceVersionData, auth)

        expect(result.points).to.equal([
          {
            bgsReference: 'TL 14/123',
            category: 'Single Point',
            depth: '123',
            description: 'RIVER OUSE AT BLETSOE',
            gridReference:
              'Within the area formed by the straight lines running between National Grid References SD 963 193, SD 963 193, SD 963 193 and SD 963 193 (RIVER OUSE AT BLETSOE)',
            hydroInterceptDistance: '8.01',
            hydroOffsetDistance: '5.56',
            hydroReference: 'TL 14/133',
            locationNote: 'Castle Farm, The Loke, Gresham, Norfolk',
            note: 'WELL IS SPRING-FED',
            primaryType: 'Groundwater',
            secondaryType: 'Borehole',
            sourceDescription: 'SURFACE WATER SOURCE OF SUPPLY',
            sourceType: 'Borehole',
            wellReference: '81312'
          }
        ])
      })
    })

    describe('when there are multiple points', () => {
      beforeEach(() => {
        licenceVersionData.licenceVersion.licenceVersionPurposes = [
          {
            points: [ViewLicencesFixture.point()]
          },
          {
            points: [{ ...ViewLicencesFixture.point(), description: 'ABSTRACTION POINT A' }]
          },
          {
            // A description with punctuation - this should be ignored
            points: [{ ...ViewLicencesFixture.point(), description: "ABSTRACTION POINT 'C'" }]
          }
        ]
      })

      it('returns the points ordered by the description', () => {
        const result = ViewPresenter.go(licenceVersionData, auth)

        expect(result.points).to.equal([
          {
            bgsReference: 'TL 14/123',
            category: 'Single Point',
            depth: '123',
            description: 'ABSTRACTION POINT A',
            gridReference:
              'Within the area formed by the straight lines running between National Grid References SD 963 193, SD 963 193, SD 963 193 and SD 963 193 (ABSTRACTION POINT A)',
            hydroInterceptDistance: '8.01',
            hydroOffsetDistance: '5.56',
            hydroReference: 'TL 14/133',
            locationNote: 'Castle Farm, The Loke, Gresham, Norfolk',
            note: 'WELL IS SPRING-FED',
            primaryType: 'Groundwater',
            secondaryType: 'Borehole',
            sourceDescription: 'SURFACE WATER SOURCE OF SUPPLY',
            sourceType: 'Borehole',
            wellReference: '81312'
          },
          {
            bgsReference: 'TL 14/123',
            category: 'Single Point',
            depth: '123',
            description: "ABSTRACTION POINT 'C'",
            gridReference:
              "Within the area formed by the straight lines running between National Grid References SD 963 193, SD 963 193, SD 963 193 and SD 963 193 (ABSTRACTION POINT 'C')",
            hydroInterceptDistance: '8.01',
            hydroOffsetDistance: '5.56',
            hydroReference: 'TL 14/133',
            locationNote: 'Castle Farm, The Loke, Gresham, Norfolk',
            note: 'WELL IS SPRING-FED',
            primaryType: 'Groundwater',
            secondaryType: 'Borehole',
            sourceDescription: 'SURFACE WATER SOURCE OF SUPPLY',
            sourceType: 'Borehole',
            wellReference: '81312'
          },
          {
            bgsReference: 'TL 14/123',
            category: 'Single Point',
            depth: '123',
            description: 'RIVER OUSE AT BLETSOE',
            gridReference:
              'Within the area formed by the straight lines running between National Grid References SD 963 193, SD 963 193, SD 963 193 and SD 963 193 (RIVER OUSE AT BLETSOE)',
            hydroInterceptDistance: '8.01',
            hydroOffsetDistance: '5.56',
            hydroReference: 'TL 14/133',
            locationNote: 'Castle Farm, The Loke, Gresham, Norfolk',
            note: 'WELL IS SPRING-FED',
            primaryType: 'Groundwater',
            secondaryType: 'Borehole',
            sourceDescription: 'SURFACE WATER SOURCE OF SUPPLY',
            sourceType: 'Borehole',
            wellReference: '81312'
          }
        ])
      })
    })
  })

  describe('the "reason" property', () => {
    describe('when the user does not have the "billing" role', () => {
      describe('and there is a "reason"', () => {
        it('returns the "reason"', () => {
          const result = ViewPresenter.go(licenceVersionData, auth)

          expect(result.reason).to.equal('Licence Holder Name/Address Change')
        })
      })

      describe('and there is no "reason"', () => {
        beforeEach(() => {
          licenceVersion.modLogs[0].reasonDescription = null
        })

        it('returns null', () => {
          const result = ViewPresenter.go(licenceVersionData, auth)

          expect(result.reason).to.be.null()
        })
      })
    })

    describe('when the user has the "billing" role', () => {
      beforeEach(() => {
        auth.credentials.scope = ['billing']
      })

      describe('and there is no "reason" or "userId"', () => {
        beforeEach(() => {
          licenceVersion.modLogs[0].reasonDescription = null
        })

        it('returns just the created on', () => {
          const result = ViewPresenter.go(licenceVersionData, auth)

          expect(result.reason).to.equal('Created on 1 January 2022')
        })
      })

      describe('and there is a reason', () => {
        describe('and we know who created it', () => {
          it('returns the reason with who created it', () => {
            const result = ViewPresenter.go(licenceVersionData, auth)

            expect(result.reason).to.equal(
              'Licence Holder Name/Address Change created on 1 January 2022 by JOBSWORTH01'
            )
          })
        })

        describe('and we do not know who created it', () => {
          beforeEach(() => {
            licenceVersion.modLogs[0].userId = null
          })

          it('returns the reason without who created it', () => {
            const result = ViewPresenter.go(licenceVersionData, auth)

            expect(result.reason).to.equal('Licence Holder Name/Address Change created on 1 January 2022')
          })
        })
      })
    })
  })
})
