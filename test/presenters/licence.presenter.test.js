'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ViewLicencesFixture = require('../fixtures/view-licences.fixture.js')

// Thing under test
const LicencePresenter = require('../../app/presenters/licence.presenter.js')

describe('Licences presenter', () => {
  describe('#formatLicencePoints()', () => {
    let points

    beforeEach(() => {
      points = [
        {
          ...ViewLicencesFixture.point(),
          sourceDescription: 'SURFACE WATER SOURCE OF SUPPLY',
          sourceType: 'Borehole'
        }
      ]
    })

    it('returns the formatted points', () => {
      const result = LicencePresenter.formatLicencePoints(points)

      expect(result).to.equal([
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

    describe('the "bgsReference" property', () => {
      describe('when the point does not have a populated bgs reference', () => {
        beforeEach(() => {
          points[0].bgsReference = null
        })

        it('returns an empty string', () => {
          const result = LicencePresenter.formatLicencePoints(points)

          expect(result[0].bgsReference).to.equal('')
        })
      })

      describe('when the point has a populated bgs reference', () => {
        it('returns the point bgs reference', () => {
          const result = LicencePresenter.formatLicencePoints(points)

          expect(result[0].bgsReference).to.equal('TL 14/123')
        })
      })
    })

    describe('the "category" property', () => {
      describe('when the point does not have a populated category', () => {
        beforeEach(() => {
          points[0].category = null
        })

        it('returns an empty string', () => {
          const result = LicencePresenter.formatLicencePoints(points)

          expect(result[0].category).to.equal('')
        })
      })

      describe('when the point has a populated category', () => {
        it('returns the point category', () => {
          const result = LicencePresenter.formatLicencePoints(points)

          expect(result[0].category).to.equal('Single Point')
        })
      })
    })

    describe('the "depth" property', () => {
      it('returns the point depth as a string', () => {
        const result = LicencePresenter.formatLicencePoints(points)

        expect(result[0].depth).to.equal('123')
      })
    })

    describe('the "description" property', () => {
      describe('when the point does not have a populated description', () => {
        beforeEach(() => {
          points[0].description = null
        })

        it('returns an empty string', () => {
          const result = LicencePresenter.formatLicencePoints(points)

          expect(result[0].description).to.equal('')
        })
      })

      describe('when the point has a populated description', () => {
        it('returns the point description', () => {
          const result = LicencePresenter.formatLicencePoints(points)

          expect(result[0].description).to.equal('RIVER OUSE AT BLETSOE')
        })
      })
    })

    describe('the "gridReference" property', () => {
      it('returns the point grid reference', () => {
        const result = LicencePresenter.formatLicencePoints(points)

        expect(result[0].gridReference).to.equal(
          'Within the area formed by the straight lines running between National Grid References SD 963 193, SD 963 193, SD 963 193 and SD 963 193 (RIVER OUSE AT BLETSOE)'
        )
      })
    })

    describe('the "hydroInterceptDistance" property', () => {
      it('returns the hydro intercept distance as a string', () => {
        const result = LicencePresenter.formatLicencePoints(points)

        expect(result[0].hydroInterceptDistance).to.equal('8.01')
      })
    })

    describe('the "hydroReference" property', () => {
      describe('when the point does not have a populated hydro reference', () => {
        beforeEach(() => {
          points[0].hydroReference = null
        })

        it('returns an empty string', () => {
          const result = LicencePresenter.formatLicencePoints(points)

          expect(result[0].hydroReference).to.equal('')
        })
      })

      describe('when the point has a populated hydro reference', () => {
        it('returns the point hydro reference', () => {
          const result = LicencePresenter.formatLicencePoints(points)

          expect(result[0].hydroReference).to.equal('TL 14/133')
        })
      })
    })

    describe('the "hydroOffsetDistance" property', () => {
      it('returns the hydro offset distance as a string', () => {
        const result = LicencePresenter.formatLicencePoints(points)

        expect(result[0].hydroOffsetDistance).to.equal('5.56')
      })
    })

    describe('the "locationNote" property', () => {
      describe('when the point does not have a populated location note', () => {
        beforeEach(() => {
          points[0].locationNote = null
        })

        it('returns an empty string', () => {
          const result = LicencePresenter.formatLicencePoints(points)

          expect(result[0].locationNote).to.equal('')
        })
      })

      describe('when the point has a populated location note', () => {
        it('returns the point location note', () => {
          const result = LicencePresenter.formatLicencePoints(points)

          expect(result[0].locationNote).to.equal('Castle Farm, The Loke, Gresham, Norfolk')
        })
      })
    })

    describe('the "note" property', () => {
      describe('when the point does not have a populated note', () => {
        beforeEach(() => {
          points[0].note = null
        })

        it('returns an empty string', () => {
          const result = LicencePresenter.formatLicencePoints(points)

          expect(result[0].note).to.equal('')
        })
      })

      describe('when the point has a populated note', () => {
        it('returns the point note', () => {
          const result = LicencePresenter.formatLicencePoints(points)

          expect(result[0].note).to.equal('WELL IS SPRING-FED')
        })
      })
    })

    describe('the "primaryType" property', () => {
      describe('when the point does not have a populated primary type', () => {
        beforeEach(() => {
          points[0].primaryType = null
        })

        it('returns an empty string', () => {
          const result = LicencePresenter.formatLicencePoints(points)

          expect(result[0].primaryType).to.equal('')
        })
      })

      describe('when the point has a populated primary type', () => {
        it('returns the point primary type', () => {
          const result = LicencePresenter.formatLicencePoints(points)

          expect(result[0].primaryType).to.equal('Groundwater')
        })
      })
    })

    describe('the "secondaryType" property', () => {
      describe('when the point does not have a populated secondary type', () => {
        beforeEach(() => {
          points[0].secondaryType = null
        })

        it('returns an empty string', () => {
          const result = LicencePresenter.formatLicencePoints(points)

          expect(result[0].secondaryType).to.equal('')
        })
      })

      describe('when the point has a populated secondary type', () => {
        it('returns the point secondary type', () => {
          const result = LicencePresenter.formatLicencePoints(points)

          expect(result[0].secondaryType).to.equal('Borehole')
        })
      })
    })

    describe('the "sourceDescription" property', () => {
      describe('when the point does not have a linked source with a populated source description', () => {
        beforeEach(() => {
          points[0].sourceDescription = null
        })

        it('returns an empty string', () => {
          const result = LicencePresenter.formatLicencePoints(points)

          expect(result[0].sourceDescription).to.equal('')
        })
      })

      describe('when the point has a linked source with a populated source description', () => {
        it('returns the point source description', () => {
          const result = LicencePresenter.formatLicencePoints(points)

          expect(result[0].sourceDescription).to.equal('SURFACE WATER SOURCE OF SUPPLY')
        })
      })
    })

    describe('the "sourceType" property', () => {
      describe('when the point does not have a linked source with a populated source type', () => {
        beforeEach(() => {
          points[0].sourceType = null
        })

        it('returns an empty string', () => {
          const result = LicencePresenter.formatLicencePoints(points)

          expect(result[0].sourceType).to.equal('')
        })
      })

      describe('when the point has a linked source with a populated source type', () => {
        it('returns the point source type', () => {
          const result = LicencePresenter.formatLicencePoints(points)

          expect(result[0].sourceType).to.equal('Borehole')
        })
      })
    })

    describe('the "wellReference" property', () => {
      describe('when the point does not have a populated well reference', () => {
        beforeEach(() => {
          points[0].wellReference = null
        })

        it('returns an empty string', () => {
          const result = LicencePresenter.formatLicencePoints(points)

          expect(result[0].wellReference).to.equal('')
        })
      })

      describe('when the point has a populated well reference', () => {
        it('returns the point well reference', () => {
          const result = LicencePresenter.formatLicencePoints(points)

          expect(result[0].wellReference).to.equal('81312')
        })
      })
    })
  })
})
