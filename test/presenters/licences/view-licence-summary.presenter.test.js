'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceModel = require('../../../app/models/licence.model.js')
const PointModel = require('../../../app/models/point.model.js')

// Thing under test
const ViewLicenceSummaryPresenter = require('../../../app/presenters/licences/view-licence-summary.presenter.js')

describe('View Licence Summary presenter', () => {
  let licence

  beforeEach(() => {
    licence = _licence()
  })

  describe('when provided with a populated licence', () => {
    it('correctly presents the data', () => {
      const result = ViewLicenceSummaryPresenter.go(licence)

      expect(result).to.equal({
        abstractionAmounts: [],
        abstractionConditions: ['Derogation clause', 'General conditions', 'Non standard quantities'],
        abstractionPeriods: ['1 April to 31 October', '1 November to 31 March'],
        abstractionPeriodsAndPurposesLinkText: 'View details of your purposes, periods and amounts',
        abstractionPeriodsCaption: 'Periods of abstraction',
        abstractionPoints: ['At National Grid Reference TL 23198 88603'],
        abstractionPointsCaption: 'Point of abstraction',
        abstractionPointsLinkText: 'View details of the abstraction point',
        activeTab: 'summary',
        documentId: '28665d16-eba3-4c9a-aa55-7ab671b0c4fb',
        endDate: null,
        licenceHolder: 'Unregistered licence',
        licenceId: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
        monitoringStations: [{
          id: 'ac075651-4781-4e24-a684-b943b98607ca',
          label: 'MEVAGISSEY FIRE STATION'
        }],
        purposes: {
          caption: 'Purposes',
          data: ['Spray Irrigation - Storage', 'Spray Irrigation - Direct']
        },
        purposesCount: 3,
        region: 'Avalon',
        sourceOfSupply: 'SURFACE WATER SOURCE OF SUPPLY',
        startDate: '1 April 2019'
      })
    })
  })

  describe('the "abstractionAmounts" property', () => {
    describe('when there are no licence version purposes', () => {
      beforeEach(() => {
        licence.licenceVersions[0].licenceVersionPurposes = []
      })

      it('returns an empty array', () => {
        const result = ViewLicenceSummaryPresenter.go(licence)

        expect(result.abstractionAmounts).to.be.empty()
      })
    })

    describe('when the there is one licence version purpose', () => {
      beforeEach(() => {
        licence.licenceVersions[0].licenceVersionPurposes = [{
          id: '7f5e0838-d87a-4c2e-8e9b-09d6814b9ec4',
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 4,
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 10,
          annualQuantity: null,
          dailyQuantity: null,
          hourlyQuantity: null,
          instantQuantity: null,
          purpose: { id: '0316229a-e76d-4785-bc2c-65075a1a8f50', description: 'Spray Irrigation - Storage' },
          points: [PointModel.fromJson({
            id: 'ab80acd6-7c2a-4f51-87f5-2c397829a0bb',
            description: null,
            ngr1: 'TL 23198 88603',
            ngr2: null,
            ngr3: null,
            ngr4: null,
            source: { id: 'b0b12db5-e95c-44a7-8008-2389fdbba9db', description: 'SURFACE WATER SOURCE OF SUPPLY' }
          })],
          licenceVersionPurposeConditions: [
            {
              id: '3844bf76-107d-49f1-b3fb-54619ac8d300',
              licenceVersionPurposeConditionType: {
                id: '2bfb0c37-5bcb-4f15-b017-27bc0afff1a0',
                displayTitle: 'General conditions'
              }
            }
          ]
        }]
      })

      describe('but it has no abstraction amounts', () => {
        it('returns an empty array', () => {
          const result = ViewLicenceSummaryPresenter.go(licence)

          expect(result.abstractionAmounts).to.be.empty()
        })
      })

      describe('and it has an annual abstraction quantity', () => {
        beforeEach(() => {
          licence.licenceVersions[0].licenceVersionPurposes[0].annualQuantity = 180000
        })

        it('returns the "per year" abstraction amount message', () => {
          const result = ViewLicenceSummaryPresenter.go(licence)

          expect(result.abstractionAmounts).to.include('180000.00 cubic metres per year')
        })
      })

      describe('and it has a daily abstraction quantity', () => {
        beforeEach(() => {
          licence.licenceVersions[0].licenceVersionPurposes[0].dailyQuantity = 720
        })

        it('returns the "per day" abstraction amount message', () => {
          const result = ViewLicenceSummaryPresenter.go(licence)

          expect(result.abstractionAmounts).to.include('720.00 cubic metres per day')
        })
      })

      describe('and it has an hourly abstraction quantity', () => {
        beforeEach(() => {
          licence.licenceVersions[0].licenceVersionPurposes[0].hourlyQuantity = 144
        })

        it('returns the "per hour" abstraction amount message', () => {
          const result = ViewLicenceSummaryPresenter.go(licence)

          expect(result.abstractionAmounts).to.include('144.00 cubic metres per hour')
        })
      })

      describe('and it has an instant abstraction quantity', () => {
        beforeEach(() => {
          licence.licenceVersions[0].licenceVersionPurposes[0].instantQuantity = 40
        })

        it('returns the "per second" abstraction amount message', () => {
          const result = ViewLicenceSummaryPresenter.go(licence)

          expect(result.abstractionAmounts).to.include('40.00 cubic metres per second')
        })
      })
    })

    describe('when there are multiple licence version purposes', () => {
      it('returns an empty array', () => {
        const result = ViewLicenceSummaryPresenter.go(licence)

        expect(result.abstractionAmounts).to.be.empty()
      })
    })
  })

  describe('the "abstractionConditions" property', () => {
    describe('when there are multiple licence version purposes', () => {
      beforeEach(() => {
        const point = PointModel.fromJson({
          id: 'ab80acd6-7c2a-4f51-87f5-2c397829a0bb',
          description: null,
          ngr1: 'TL 23198 88603',
          ngr2: null,
          ngr3: null,
          ngr4: null,
          source: { id: 'b0b12db5-e95c-44a7-8008-2389fdbba9db', description: 'SURFACE WATER SOURCE OF SUPPLY' }
        })

        licence.licenceVersions[0].licenceVersionPurposes = [{
          id: '7f5e0838-d87a-4c2e-8e9b-09d6814b9ec4',
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 4,
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 10,
          points: [point],
          purpose: { id: '0316229a-e76d-4785-bc2c-65075a1a8f50', description: 'Spray Irrigation - Storage' },
          licenceVersionPurposeConditions: []
        },
        {
          id: 'da6cbb9b-edcb-4b5b-8d3a-fab22ce6ee8b',
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 11,
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 3,
          points: [point],
          purpose: { id: '0316229a-e76d-4785-bc2c-65075a1a8f50', description: 'Spray Irrigation - Storage' },
          licenceVersionPurposeConditions: []
        }]
      })

      describe('and each contains a condition with a different display title', () => {
        beforeEach(() => {
          licence.licenceVersions[0].licenceVersionPurposes[0].licenceVersionPurposeConditions.push({
            id: '3844bf76-107d-49f1-b3fb-54619ac8d300',
            licenceVersionPurposeConditionType: {
              id: '2bfb0c37-5bcb-4f15-b017-27bc0afff1a0',
              displayTitle: 'General conditions'
            }
          })

          licence.licenceVersions[0].licenceVersionPurposes[1].licenceVersionPurposeConditions.push({
            id: '0c466bc8-c79c-44e0-b6ca-b95e0bfffddf',
            licenceVersionPurposeConditionType: {
              id: '7ee108f1-268d-4ded-81c7-d397c075e7db',
              displayTitle: 'Derogation clause'
            }
          })
        })

        it('returns an array containing all the titles in alphabetical order', () => {
          const result = ViewLicenceSummaryPresenter.go(licence)

          expect(result.abstractionConditions).to.equal(['Derogation clause', 'General conditions'])
        })
      })

      describe('and each contains conditions with the same display titles', () => {
        beforeEach(() => {
          licence.licenceVersions[0].licenceVersionPurposes[0].licenceVersionPurposeConditions.push({
            id: '3844bf76-107d-49f1-b3fb-54619ac8d300',
            licenceVersionPurposeConditionType: {
              id: '2bfb0c37-5bcb-4f15-b017-27bc0afff1a0',
              displayTitle: 'General conditions'
            }
          })

          licence.licenceVersions[0].licenceVersionPurposes[1].licenceVersionPurposeConditions.push({
            id: '0c466bc8-c79c-44e0-b6ca-b95e0bfffddf',
            licenceVersionPurposeConditionType: {
              id: '2bfb0c37-5bcb-4f15-b017-27bc0afff1a0',
              displayTitle: 'General conditions'
            }
          })
        })

        it('returns an array containing only the distinct title', () => {
          const result = ViewLicenceSummaryPresenter.go(licence)

          expect(result.abstractionConditions).to.equal(['General conditions'])
        })
      })
    })

    describe('when there is a single licence version purpose', () => {
      beforeEach(() => {
        licence.licenceVersions[0].licenceVersionPurposes = [{
          id: '7f5e0838-d87a-4c2e-8e9b-09d6814b9ec4',
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 4,
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 10,
          points: [PointModel.fromJson({
            id: 'ab80acd6-7c2a-4f51-87f5-2c397829a0bb',
            description: null,
            ngr1: 'TL 23198 88603',
            ngr2: null,
            ngr3: null,
            ngr4: null,
            source: { id: 'b0b12db5-e95c-44a7-8008-2389fdbba9db', description: 'SURFACE WATER SOURCE OF SUPPLY' }
          })],
          purpose: { id: '0316229a-e76d-4785-bc2c-65075a1a8f50', description: 'Spray Irrigation - Storage' },
          licenceVersionPurposeConditions: []
        }]
      })

      describe('with conditions with different display titles', () => {
        beforeEach(() => {
          licence.licenceVersions[0].licenceVersionPurposes[0].licenceVersionPurposeConditions.push({
            id: '3844bf76-107d-49f1-b3fb-54619ac8d300',
            licenceVersionPurposeConditionType: {
              id: '2bfb0c37-5bcb-4f15-b017-27bc0afff1a0',
              displayTitle: 'General conditions'
            }
          },
          {
            id: '0c466bc8-c79c-44e0-b6ca-b95e0bfffddf',
            licenceVersionPurposeConditionType: {
              id: '7ee108f1-268d-4ded-81c7-d397c075e7db',
              displayTitle: 'Derogation clause'
            }
          })
        })

        it('returns an array containing all the titles in alphabetical order', () => {
          const result = ViewLicenceSummaryPresenter.go(licence)

          expect(result.abstractionConditions).to.equal(['Derogation clause', 'General conditions'])
        })
      })

      describe('with conditions with the same display titles', () => {
        beforeEach(() => {
          licence.licenceVersions[0].licenceVersionPurposes[0].licenceVersionPurposeConditions.push({
            id: '3844bf76-107d-49f1-b3fb-54619ac8d300',
            licenceVersionPurposeConditionType: {
              id: '2bfb0c37-5bcb-4f15-b017-27bc0afff1a0',
              displayTitle: 'General conditions'
            }
          },
          {
            id: '0c466bc8-c79c-44e0-b6ca-b95e0bfffddf',
            licenceVersionPurposeConditionType: {
              id: '2bfb0c37-5bcb-4f15-b017-27bc0afff1a0',
              displayTitle: 'General conditions'
            }
          })
        })

        it('returns an array containing only the distinct title', () => {
          const result = ViewLicenceSummaryPresenter.go(licence)

          expect(result.abstractionConditions).to.equal(['General conditions'])
        })
      })
    })
  })

  describe('the "abstractionPeriods" property', () => {
    describe('when there is no "current" licence version', () => {
      beforeEach(() => {
        licence.licenceVersions = []
      })

      it('returns an empty array', () => {
        const result = ViewLicenceSummaryPresenter.go(licence)

        expect(result.abstractionPeriods).to.be.empty()
      })
    })

    describe('when there is a "current" licence version', () => {
      describe('but no licence version purposes linked to it', () => {
        beforeEach(() => {
          licence.licenceVersions[0].licenceVersionPurposes = []
        })

        it('returns an empty array', () => {
          const result = ViewLicenceSummaryPresenter.go(licence)

          expect(result.abstractionPeriods).to.be.empty()
        })
      })

      describe('and a single licence version purpose linked to it', () => {
        beforeEach(() => {
          licence.licenceVersions[0].licenceVersionPurposes.pop()
          licence.licenceVersions[0].licenceVersionPurposes.pop()
        })

        it('returns the abstraction period formatted for display', () => {
          const result = ViewLicenceSummaryPresenter.go(licence)

          expect(result.abstractionPeriods).to.equal(['1 April to 31 October'])
        })
      })

      describe('and multiple licence version purposes linked to it', () => {
        describe('that all have different abstraction periods', () => {
          beforeEach(() => {
            licence.licenceVersions[0].licenceVersionPurposes.pop()
          })

          it('returns the abstraction periods formatted for display', () => {
            const result = ViewLicenceSummaryPresenter.go(licence)

            expect(result.abstractionPeriods).to.equal(['1 April to 31 October', '1 November to 31 March'])
          })
        })

        describe('that have the same abstraction periods', () => {
          beforeEach(() => {
            licence.licenceVersions[0].licenceVersionPurposes.splice(1, 1)
          })

          it('returns the abstraction period formatted for display', () => {
            const result = ViewLicenceSummaryPresenter.go(licence)

            expect(result.abstractionPeriods).to.equal(['1 April to 31 October'])
          })
        })
      })
    })
  })

  describe('the "abstractionPeriodsAndPurposesLinkText" property', () => {
    describe('when there is no "current" licence version', () => {
      beforeEach(() => {
        licence.licenceVersions = []
      })

      it('returns null', () => {
        const result = ViewLicenceSummaryPresenter.go(licence)

        expect(result.abstractionPeriodsAndPurposesLinkText).to.equal(null)
      })
    })

    describe('when there is a "current" licence version', () => {
      describe('but no licence version purposes linked to it', () => {
        beforeEach(() => {
          licence.licenceVersions[0].licenceVersionPurposes = []
        })

        it('returns null', () => {
          const result = ViewLicenceSummaryPresenter.go(licence)

          expect(result.abstractionPeriodsAndPurposesLinkText).to.equal(null)
        })
      })

      describe('and a single licence version purpose linked to it', () => {
        beforeEach(() => {
          licence.licenceVersions[0].licenceVersionPurposes.pop()
          licence.licenceVersions[0].licenceVersionPurposes.pop()
        })

        it('returns the singular version of the link (period and purpose)', () => {
          const result = ViewLicenceSummaryPresenter.go(licence)

          expect(result.abstractionPeriodsAndPurposesLinkText)
            .to
            .equal('View details of your purpose, period and amounts')
        })
      })

      describe('and multiple licence version purposes linked to it', () => {
        describe('that all have different abstraction periods', () => {
          describe('but the same purpose', () => {
            beforeEach(() => {
              licence.licenceVersions[0].licenceVersionPurposes.pop()
            })

            it('returns a mixed version of the link (periods and purpose)', () => {
              const result = ViewLicenceSummaryPresenter.go(licence)

              expect(result.abstractionPeriodsAndPurposesLinkText)
                .to
                .equal('View details of your purpose, periods and amounts')
            })
          })

          describe('and different purposes', () => {
            beforeEach(() => {
              licence.licenceVersions[0].licenceVersionPurposes.pop()
              licence.licenceVersions[0].licenceVersionPurposes[1].purpose = {
                id: 'd1fc1c6f-bff0-4da2-a41a-033f151fddc7', description: 'Spray Irrigation - Direct'
              }
            })

            it('returns the plural version of the link (periods and purposes)', () => {
              const result = ViewLicenceSummaryPresenter.go(licence)

              expect(result.abstractionPeriodsAndPurposesLinkText)
                .to
                .equal('View details of your purposes, periods and amounts')
            })
          })
        })

        describe('that all have the same abstraction period', () => {
          beforeEach(() => {
            licence.licenceVersions[0].licenceVersionPurposes.splice(1, 1)
          })

          describe('and the same purpose', () => {
            beforeEach(() => {
              licence.licenceVersions[0].licenceVersionPurposes[1].purpose = {
                id: '0316229a-e76d-4785-bc2c-65075a1a8f50', description: 'Spray Irrigation - Storage'
              }
            })

            it('returns the singular version of the link (period and purpose)', () => {
              const result = ViewLicenceSummaryPresenter.go(licence)

              expect(result.abstractionPeriodsAndPurposesLinkText)
                .to
                .equal('View details of your purpose, period and amounts')
            })
          })

          describe('but different purposes', () => {
            it('returns a mixed version of the link (period and purposes)', () => {
              const result = ViewLicenceSummaryPresenter.go(licence)

              expect(result.abstractionPeriodsAndPurposesLinkText)
                .to
                .equal('View details of your purposes, period and amounts')
            })
          })
        })
      })
    })
  })

  describe('the "abstractionPeriodsCaption" property', () => {
    describe('when no abstraction periods have been extracted from the licence data', () => {
      beforeEach(() => {
        licence.licenceVersions = []
      })

      it('returns the singular caption', () => {
        const result = ViewLicenceSummaryPresenter.go(licence)

        expect(result.abstractionPeriodsCaption).to.equal('Period of abstraction')
      })
    })

    describe('when one unique abstraction period has been extracted from the licence data', () => {
      beforeEach(() => {
        licence.licenceVersions[0].licenceVersionPurposes.splice(1, 1)
      })

      it('returns the singular caption', () => {
        const result = ViewLicenceSummaryPresenter.go(licence)

        expect(result.abstractionPeriodsCaption).to.equal('Period of abstraction')
      })
    })

    describe('when multiple abstraction periods have been extracted from the licence data', () => {
      it('returns the plural caption', () => {
        const result = ViewLicenceSummaryPresenter.go(licence)

        expect(result.abstractionPeriodsCaption).to.equal('Periods of abstraction')
      })
    })
  })

  describe('the "abstractionPoints" property', () => {
    describe('when there is no "current" licence version', () => {
      beforeEach(() => {
        licence.licenceVersions = []
      })

      it('returns an empty array', () => {
        const result = ViewLicenceSummaryPresenter.go(licence)

        expect(result.abstractionPoints).to.be.empty()
      })
    })

    describe('when there is a "current" licence version', () => {
      describe('but no licence version purposes linked to it', () => {
        beforeEach(() => {
          licence.licenceVersions[0].licenceVersionPurposes = []
        })

        it('returns an empty array', () => {
          const result = ViewLicenceSummaryPresenter.go(licence)

          expect(result.abstractionPoints).to.be.empty()
        })
      })

      describe('and a single licence version purpose linked to it', () => {
        beforeEach(() => {
          licence.licenceVersions[0].licenceVersionPurposes.pop()
          licence.licenceVersions[0].licenceVersionPurposes.pop()
        })

        describe('that has a single point', () => {
          it('returns the abstraction point formatted for display', () => {
            const result = ViewLicenceSummaryPresenter.go(licence)

            expect(result.abstractionPoints).to.equal(['At National Grid Reference TL 23198 88603'])
          })
        })

        describe('that has multiple points', () => {
          beforeEach(() => {
            licence.licenceVersions[0].licenceVersionPurposes[0].points.push(PointModel.fromJson({
              description: 'RIVER MEDWAY AT YALDING INTAKE',
              id: 'd03d7d7c-4e33-4b4d-ac9b-6ebac9a5e5f6',
              ngr1: 'TQ 69212 50394',
              ngr2: null,
              ngr3: null,
              ngr4: null,
              source: { id: 'b0b12db5-e95c-44a7-8008-2389fdbba9db', description: 'SURFACE WATER SOURCE OF SUPPLY' }
            }))
          })

          it('returns the abstraction points formatted for display', () => {
            const result = ViewLicenceSummaryPresenter.go(licence)

            expect(result.abstractionPoints).to.equal([
              'At National Grid Reference TL 23198 88603',
              'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)'
            ])
          })
        })
      })

      describe('and multiple licence version purposes linked to it', () => {
        describe('that have the same point', () => {
          it('returns the abstraction point formatted for display', () => {
            const result = ViewLicenceSummaryPresenter.go(licence)

            expect(result.abstractionPoints).to.equal(['At National Grid Reference TL 23198 88603'])
          })
        })

        describe('some of which have different points', () => {
          beforeEach(() => {
            licence.licenceVersions[0].licenceVersionPurposes[1].points[0] = PointModel.fromJson({
              description: 'RIVER MEDWAY AT YALDING INTAKE',
              id: 'd03d7d7c-4e33-4b4d-ac9b-6ebac9a5e5f6',
              ngr1: 'TQ 69212 50394',
              ngr2: null,
              ngr3: null,
              ngr4: null,
              source: { id: 'b0b12db5-e95c-44a7-8008-2389fdbba9db', description: 'SURFACE WATER SOURCE OF SUPPLY' }
            })
          })

          it('returns the abstraction points formatted for display', () => {
            const result = ViewLicenceSummaryPresenter.go(licence)

            expect(result.abstractionPoints).to.equal([
              'At National Grid Reference TL 23198 88603',
              'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)'
            ])
          })
        })
      })
    })
  })

  describe('the "abstractionPointsCaption" property', () => {
    describe('when there is no "current" licence version', () => {
      beforeEach(() => {
        licence.licenceVersions = []
      })

      it('returns the singular caption', () => {
        const result = ViewLicenceSummaryPresenter.go(licence)

        expect(result.abstractionPointsCaption).to.equal('Point of abstraction')
      })
    })

    describe('when there is a "current" licence version', () => {
      describe('but no licence version purposes linked to it', () => {
        beforeEach(() => {
          licence.licenceVersions[0].licenceVersionPurposes = []
        })

        it('returns the singular caption', () => {
          const result = ViewLicenceSummaryPresenter.go(licence)

          expect(result.abstractionPointsCaption).to.equal('Point of abstraction')
        })
      })

      describe('and at least one licence version purpose linked to it', () => {
        describe('but the points are all the same', () => {
          it('returns the singular caption', () => {
            const result = ViewLicenceSummaryPresenter.go(licence)

            expect(result.abstractionPointsCaption).to.equal('Point of abstraction')
          })
        })

        describe('and the points are not all the same', () => {
          beforeEach(() => {
            licence.licenceVersions[0].licenceVersionPurposes[1].points[0] = PointModel.fromJson({
              description: 'RIVER MEDWAY AT YALDING INTAKE',
              id: 'd03d7d7c-4e33-4b4d-ac9b-6ebac9a5e5f6',
              ngr1: 'TQ 69212 50394',
              ngr2: null,
              ngr3: null,
              ngr4: null,
              source: { id: 'b0b12db5-e95c-44a7-8008-2389fdbba9db', description: 'SURFACE WATER SOURCE OF SUPPLY' }
            })
          })

          it('returns the plural caption', () => {
            const result = ViewLicenceSummaryPresenter.go(licence)

            expect(result.abstractionPointsCaption).to.equal('Points of abstraction')
          })
        })
      })
    })
  })

  describe('the "abstractionPointsLinkText" property', () => {
    describe('when there is no "current" licence version', () => {
      beforeEach(() => {
        licence.licenceVersions = []
      })

      it('returns the singular link text', () => {
        const result = ViewLicenceSummaryPresenter.go(licence)

        expect(result.abstractionPointsLinkText).to.equal('View details of the abstraction point')
      })
    })

    describe('when there is a "current" licence version', () => {
      describe('but no licence version purposes linked to it', () => {
        beforeEach(() => {
          licence.licenceVersions[0].licenceVersionPurposes = []
        })

        it('returns the singular link text', () => {
          const result = ViewLicenceSummaryPresenter.go(licence)

          expect(result.abstractionPointsLinkText).to.equal('View details of the abstraction point')
        })
      })

      describe('and at least one licence version purpose linked to it', () => {
        describe('but the points are all the same', () => {
          it('returns the singular link text', () => {
            const result = ViewLicenceSummaryPresenter.go(licence)

            expect(result.abstractionPointsLinkText).to.equal('View details of the abstraction point')
          })
        })

        describe('and the points are not all the same', () => {
          beforeEach(() => {
            licence.licenceVersions[0].licenceVersionPurposes[1].points[0] = PointModel.fromJson({
              description: 'RIVER MEDWAY AT YALDING INTAKE',
              id: 'd03d7d7c-4e33-4b4d-ac9b-6ebac9a5e5f6',
              ngr1: 'TQ 69212 50394',
              ngr2: null,
              ngr3: null,
              ngr4: null,
              source: { id: 'b0b12db5-e95c-44a7-8008-2389fdbba9db', description: 'SURFACE WATER SOURCE OF SUPPLY' }
            })
          })

          it('returns the plural link text', () => {
            const result = ViewLicenceSummaryPresenter.go(licence)

            expect(result.abstractionPointsLinkText).to.equal('View details of the abstraction points')
          })
        })
      })
    })
  })

  describe('the "endDate" property', () => {
    describe('when the licence expired date is null', () => {
      it('returns null', () => {
        const result = ViewLicenceSummaryPresenter.go(licence)

        expect(result.endDate).to.be.null()
      })
    })

    describe('when the licence expired date is set to a date less than or equal to today', () => {
      beforeEach(() => {
        // NOTE: The date we get back from the DB is without time. If we just assigned new Date() to expiredDate
        // there is a chance the test could fail depending on how quickly this is compared to the logic in the
        // presenter
        const today = new Date()

        today.setHours(0, 0, 0, 0)

        licence.expiredDate = today
      })

      it('returns null', () => {
        const result = ViewLicenceSummaryPresenter.go(licence)

        expect(result.endDate).to.be.null()
      })
    })

    describe('when the licence expired date is set to a date greater than today (2099-04-01)', () => {
      beforeEach(() => {
        licence.expiredDate = new Date('2099-04-01')
      })

      it('returns "1 April 2099"', () => {
        const result = ViewLicenceSummaryPresenter.go(licence)

        expect(result.endDate).to.equal('1 April 2099')
      })
    })
  })

  describe('the "licenceHolder" property', () => {
    describe('when the licence holder is not set', () => {
      it('returns "Unregistered licence"', () => {
        const result = ViewLicenceSummaryPresenter.go(licence)

        expect(result.licenceHolder).to.equal('Unregistered licence')
      })
    })

    describe('when the licence holder is set', () => {
      beforeEach(() => {
        // We 'mimic' licenceDocument containing a ContactModel instance that is populated. If it was the call to its
        // instance method $name() would return the contact's name. We pretend in order to test the logic in the
        // presenter
        const contact = {
          $name: () => { return 'Barbara Liskov' }
        }

        licence.licenceDocument = {
          licenceDocumentRoles: [{ contact }]
        }
      })

      it('returns "Barbara Liskov"', () => {
        const result = ViewLicenceSummaryPresenter.go(licence)

        expect(result.licenceHolder).to.equal('Barbara Liskov')
      })
    })
  })

  describe('the "monitoringStations" property', () => {
    describe('when the licence is linked to no monitoring stations', () => {
      beforeEach(() => {
        licence.licenceGaugingStations = []
      })

      it('will return an empty array', async () => {
        const result = await ViewLicenceSummaryPresenter.go(licence)

        expect(result.monitoringStations).to.equal([])
      })
    })

    describe('when the licence is linked to a single monitoring station', () => {
      it("will return an array with the monitoring station's details", async () => {
        const result = await ViewLicenceSummaryPresenter.go(licence)

        expect(result.monitoringStations).to.equal([{
          id: 'ac075651-4781-4e24-a684-b943b98607ca',
          label: 'MEVAGISSEY FIRE STATION'
        }])
      })
    })

    describe('when the licence is linked to multiple monitoring stations', () => {
      describe('that are all different', () => {
        beforeEach(() => {
          licence.licenceGaugingStations.push({
            id: '13f7504d-2750-4dd9-94dd-929e99e900a0',
            gaugingStation: {
              id: '4a6493b0-1d8d-429f-a7a0-3a6541d5ff1f',
              label: 'AVALON FIRE STATION'
            }
          })
        })

        it('will return an array with each monitoring stations details', async () => {
          const result = await ViewLicenceSummaryPresenter.go(licence)

          expect(result.monitoringStations).to.equal([
            { id: 'ac075651-4781-4e24-a684-b943b98607ca', label: 'MEVAGISSEY FIRE STATION' },
            { id: '4a6493b0-1d8d-429f-a7a0-3a6541d5ff1f', label: 'AVALON FIRE STATION' }
          ])
        })
      })

      describe('that are all the same station', () => {
        beforeEach(() => {
          licence.licenceGaugingStations.push({
            id: 'e813542c-50a0-4497-be1a-00af3a810cac',
            gaugingStation: {
              id: 'ac075651-4781-4e24-a684-b943b98607ca',
              label: 'MEVAGISSEY FIRE STATION'
            }
          })
        })

        it("will return an array with just the one monitoring station's details", async () => {
          const result = await ViewLicenceSummaryPresenter.go(licence)

          expect(result.monitoringStations).to.equal([{
            id: 'ac075651-4781-4e24-a684-b943b98607ca',
            label: 'MEVAGISSEY FIRE STATION'
          }])
        })
      })
    })
  })

  describe('the "purposes" property', () => {
    describe('when there is no "current" licence version', () => {
      beforeEach(() => {
        licence.licenceVersions = []
      })

      it('returns null', () => {
        const result = ViewLicenceSummaryPresenter.go(licence)

        expect(result.purposes).to.equal(null)
      })
    })

    describe('when there is a "current" licence version', () => {
      describe('but no licence version purposes linked to it', () => {
        beforeEach(() => {
          licence.licenceVersions[0].licenceVersionPurposes = []
        })

        it('returns null', () => {
          const result = ViewLicenceSummaryPresenter.go(licence)

          expect(result.purposes).to.equal(null)
        })
      })

      describe('and a single licence version purpose linked to it', () => {
        beforeEach(() => {
          licence.licenceVersions[0].licenceVersionPurposes.pop()
          licence.licenceVersions[0].licenceVersionPurposes.pop()
        })

        it('returns the singular version of the caption and the purpose descriptions', () => {
          const result = ViewLicenceSummaryPresenter.go(licence)

          expect(result.purposes).to.equal({
            caption: 'Purpose',
            data: ['Spray Irrigation - Storage']
          })
        })
      })

      describe('and multiple licence version purposes linked to it', () => {
        describe('that all have different purposes', () => {
          beforeEach(() => {
            licence.licenceVersions[0].licenceVersionPurposes.splice(1, 1)
          })

          it('returns the plural version of the caption and all purpose descriptions', () => {
            const result = ViewLicenceSummaryPresenter.go(licence)

            expect(result.purposes).to.equal({
              caption: 'Purposes',
              data: ['Spray Irrigation - Storage', 'Spray Irrigation - Direct']
            })
          })
        })

        describe('that have some abstraction purposes that are the same', () => {
          it('returns the plural version of the captions and the unique purpose descriptions', () => {
            const result = ViewLicenceSummaryPresenter.go(licence)

            expect(result.purposes).to.equal({
              caption: 'Purposes',
              data: ['Spray Irrigation - Storage', 'Spray Irrigation - Direct']
            })
          })
        })
      })
    })
  })

  describe('the "sourceOfSupply" property', () => {
    describe('when there is no "current" licence version', () => {
      beforeEach(() => {
        licence.licenceVersions = []
      })

      it('returns null', async () => {
        const result = await ViewLicenceSummaryPresenter.go(licence)

        expect(result.sourceOfSupply).to.equal(null)
      })
    })

    describe('when there is a "current" licence version', () => {
      describe('but no licence version purposes linked to it', () => {
        beforeEach(() => {
          licence.licenceVersions[0].licenceVersionPurposes = []
        })

        it('returns null', async () => {
          const result = await ViewLicenceSummaryPresenter.go(licence)

          expect(result.sourceOfSupply).to.equal(null)
        })
      })

      describe('and at least one licence version purpose linked to it', () => {
        it('returns the source description of the first point', async () => {
          const result = await ViewLicenceSummaryPresenter.go(licence)

          expect(result.sourceOfSupply).to.equal('SURFACE WATER SOURCE OF SUPPLY')
        })
      })
    })
  })
})

function _licence () {
  const point = PointModel.fromJson({
    id: 'ab80acd6-7c2a-4f51-87f5-2c397829a0bb',
    description: null,
    ngr1: 'TL 23198 88603',
    ngr2: null,
    ngr3: null,
    ngr4: null,
    source: { id: 'b0b12db5-e95c-44a7-8008-2389fdbba9db', description: 'SURFACE WATER SOURCE OF SUPPLY' }
  })

  return LicenceModel.fromJson({
    id: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
    expiredDate: null,
    startDate: new Date('2019-04-01'),
    region: {
      id: '740375f0-5add-4335-8ed5-b21b55b4a228',
      displayName: 'Avalon'
    },
    licenceVersions: [{
      id: 'ac9a8a56-c9ae-43d0-a003-296b4aa7481d',
      startDate: new Date('2022-04-01'),
      status: 'current',
      licenceVersionPurposes: [
        {
          id: '7f5e0838-d87a-4c2e-8e9b-09d6814b9ec4',
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 4,
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 10,
          annualQuantity: 180000,
          dailyQuantity: 720,
          hourlyQuantity: 144,
          instantQuantity: 40,
          purpose: { id: '0316229a-e76d-4785-bc2c-65075a1a8f50', description: 'Spray Irrigation - Storage' },
          points: [point],
          licenceVersionPurposeConditions: [
            {
              id: '3844bf76-107d-49f1-b3fb-54619ac8d300',
              licenceVersionPurposeConditionType: {
                id: '2bfb0c37-5bcb-4f15-b017-27bc0afff1a0',
                displayTitle: 'General conditions'
              }
            },
            {
              id: '0c466bc8-c79c-44e0-b6ca-b95e0bfffddf',
              licenceVersionPurposeConditionType: {
                id: '7ee108f1-268d-4ded-81c7-d397c075e7db',
                displayTitle: 'Derogation clause'
              }
            }
          ]
        },
        {
          id: 'da6cbb9b-edcb-4b5b-8d3a-fab22ce6ee8b',
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 11,
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 3,
          annualQuantity: null,
          dailyQuantity: null,
          hourlyQuantity: null,
          instantQuantity: null,
          purpose: { id: '0316229a-e76d-4785-bc2c-65075a1a8f50', description: 'Spray Irrigation - Storage' },
          points: [point],
          licenceVersionPurposeConditions: [
            {
              id: '999d98b0-ba6a-4a82-8cb6-03253a6722aa',
              licenceVersionPurposeConditionType: {
                id: '2bfb0c37-5bcb-4f15-b017-27bc0afff1a0',
                displayTitle: 'General conditions'
              }
            }
          ]
        },
        {
          id: 'f68ed9a0-4a2b-42da-8f5b-c5c897113121',
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 4,
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 10,
          annualQuantity: null,
          dailyQuantity: null,
          hourlyQuantity: null,
          instantQuantity: null,
          purpose: { id: 'd1fc1c6f-bff0-4da2-a41a-033f151fddc7', description: 'Spray Irrigation - Direct' },
          points: [point],
          licenceVersionPurposeConditions: [
            {
              id: 'd5f30ba6-8170-4596-9276-362efb2175fa',
              licenceVersionPurposeConditionType: {
                id: '923846ea-da9a-4687-bb66-6dd11411afb9',
                displayTitle: 'Non standard quantities'
              }
            }
          ]
        }
      ]
    }],
    licenceGaugingStations: [{
      id: 'f775f2cf-9b7c-4f1e-bb6f-6e81b34b1a8d',
      gaugingStation: {
        id: 'ac075651-4781-4e24-a684-b943b98607ca',
        label: 'MEVAGISSEY FIRE STATION'
      }
    }],
    licenceDocument: null,
    licenceDocumentHeader: { id: '28665d16-eba3-4c9a-aa55-7ab671b0c4fb' }
  })
}
