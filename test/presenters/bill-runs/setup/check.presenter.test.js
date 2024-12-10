'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const RegionModel = require('../../../../app/models/region.model.js')

// Thing under test
const CheckPresenter = require('../../../../app/presenters/bill-runs/setup/check.presenter.js')

describe('Bill Runs Setup Check presenter', () => {
  const regionId = '292fe1c3-c9d4-47dd-a01b-0ac916497af5'

  let existsResults
  let session

  beforeEach(() => {
    session = {
      id: '98ad3a1f-8e4f-490a-be05-0aece6755466',
      region: regionId,
      type: 'annual'
    }

    existsResults = {
      matches: [
        {
          id: 'c0608545-9870-4605-a407-5ff49f8a5182',
          batchType: 'annual',
          billRunNumber: 12345,
          createdAt: new Date('2024-05-01'),
          region: { id: regionId, displayName: 'Stormlands' },
          scheme: 'sroc',
          status: 'sent',
          summer: false,
          toFinancialYearEnding: 2024
        }
      ],
      toFinancialYearEnding: 2025
    }

    Sinon.stub(RegionModel, 'query').returns({
      select: Sinon.stub().returnsThis(),
      findById: Sinon.stub().withArgs(regionId).resolves({ id: regionId, displayName: 'Stormlands' })
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when provided with a bill run setup session record', () => {
    describe('and there is no existing blocking bill run', () => {
      beforeEach(() => {
        existsResults.matches = []
      })

      it('correctly presents the data', async () => {
        const result = await CheckPresenter.go(session, existsResults)

        expect(result).to.equal({
          backLink: '/system/bill-runs/setup/98ad3a1f-8e4f-490a-be05-0aece6755466/region',
          billRunLink: null,
          billRunNumber: null,
          billRunStatus: null,
          billRunType: 'Annual',
          chargeScheme: 'Current',
          dateCreated: null,
          exists: false,
          financialYear: '2024 to 2025',
          pageTitle: 'Check the bill run to be created',
          regionName: 'Stormlands',
          sessionId: '98ad3a1f-8e4f-490a-be05-0aece6755466',
          warningMessage: null
        })
      })
    })

    describe('and there is an existing blocking bill run', () => {
      it('correctly presents the data', async () => {
        const result = await CheckPresenter.go(session, existsResults)

        expect(result).to.equal({
          backLink: '/system/bill-runs/setup/98ad3a1f-8e4f-490a-be05-0aece6755466/region',
          billRunLink: '/system/bill-runs/c0608545-9870-4605-a407-5ff49f8a5182',
          billRunNumber: 12345,
          billRunStatus: 'sent',
          billRunType: 'Annual',
          chargeScheme: 'Current',
          dateCreated: '1 May 2024',
          exists: true,
          financialYear: '2024 to 2025',
          pageTitle: 'This bill run already exists',
          regionName: 'Stormlands',
          sessionId: '98ad3a1f-8e4f-490a-be05-0aece6755466',
          warningMessage: 'You can only have one Annual bill run per region in a financial year'
        })
      })
    })
  })

  describe('the "backLink" property', () => {
    describe('when the selected bill run type is not "two_part_tariff" or "two_part_supplementary"', () => {
      beforeEach(() => {
        session.type = 'supplementary'
      })

      it('returns a link to the region page', async () => {
        const result = await CheckPresenter.go(session, existsResults)

        expect(result.backLink).to.equal('/system/bill-runs/setup/98ad3a1f-8e4f-490a-be05-0aece6755466/region')
      })
    })

    describe('when the selected bill run type is "two_part_tariff"', () => {
      beforeEach(() => {
        session.type = 'two_part_tariff'
      })

      describe('and the selected financial year is in the SROC period', () => {
        beforeEach(() => {
          session.year = '2023'
        })

        it('returns a link to the financial year page', async () => {
          const result = await CheckPresenter.go(session, existsResults)

          expect(result.backLink).to.equal('/system/bill-runs/setup/98ad3a1f-8e4f-490a-be05-0aece6755466/year')
        })
      })

      describe('and the selected financial year is in the PRESROC period', () => {
        beforeEach(() => {
          session.year = '2022'
        })

        it('returns a link to the season page', async () => {
          const result = await CheckPresenter.go(session, existsResults)

          expect(result.backLink).to.equal('/system/bill-runs/setup/98ad3a1f-8e4f-490a-be05-0aece6755466/season')
        })
      })
    })

    describe('when the selected bill run type is "two_part_supplementary"', () => {
      beforeEach(() => {
        session.type = 'two_part_supplementary'
      })

      it('returns a link to the financial year page', async () => {
        const result = await CheckPresenter.go(session, existsResults)

        expect(result.backLink).to.equal('/system/bill-runs/setup/98ad3a1f-8e4f-490a-be05-0aece6755466/year')
      })
    })
  })

  describe('the "billRunLink" property', () => {
    describe('when there is no existing blocking bill run', () => {
      beforeEach(() => {
        existsResults.matches = []
      })

      it('returns null', async () => {
        const result = await CheckPresenter.go(session, existsResults)

        expect(result.billRunLink).to.be.null()
      })
    })

    describe('when there is an existing blocking bill run', () => {
      describe("and its status is not 'review'", () => {
        it('returns the view bill run link to the existing bill run', async () => {
          const result = await CheckPresenter.go(session, existsResults)

          expect(result.billRunLink).to.equal('/system/bill-runs/c0608545-9870-4605-a407-5ff49f8a5182')
        })
      })

      describe("and its status is 'review'", () => {
        beforeEach(() => {
          existsResults.matches[0].status = 'review'
        })

        describe('and its financial year is in the SROC period', () => {
          it('returns a link to the SROC review page', async () => {
            const result = await CheckPresenter.go(session, existsResults)

            expect(result.billRunLink).to.equal('/system/bill-runs/review/c0608545-9870-4605-a407-5ff49f8a5182')
          })
        })

        describe('and its financial year is in the PRESROC period', () => {
          beforeEach(() => {
            existsResults.matches[0].toFinancialYearEnding = 2022
          })

          it('returns a link to the PRESROC review page', async () => {
            const result = await CheckPresenter.go(session, existsResults)

            expect(result.billRunLink).to.equal(
              '/billing/batch/c0608545-9870-4605-a407-5ff49f8a5182/two-part-tariff-review'
            )
          })
        })
      })
    })
  })

  describe('the "billRunNumber" property', () => {
    describe('when there is no existing blocking bill run', () => {
      beforeEach(() => {
        existsResults.matches = []
      })

      it('returns null', async () => {
        const result = await CheckPresenter.go(session, existsResults)

        expect(result.billRunNumber).to.be.null()
      })
    })

    describe('when there is an existing blocking bill run', () => {
      it('returns its bill run number', async () => {
        const result = await CheckPresenter.go(session, existsResults)

        expect(result.billRunNumber).to.equal(12345)
      })
    })
  })

  describe('the "billRunStatus" property', () => {
    describe('when there is no existing blocking bill run', () => {
      beforeEach(() => {
        existsResults.matches = []
      })

      it('returns null', async () => {
        const result = await CheckPresenter.go(session, existsResults)

        expect(result.billRunStatus).to.be.null()
      })
    })

    describe('when there is an existing blocking bill run', () => {
      it('returns its status', async () => {
        const result = await CheckPresenter.go(session, existsResults)

        expect(result.billRunStatus).to.equal('sent')
      })
    })
  })

  describe('the "billRunType" property', () => {
    describe('when there is no existing blocking bill run', () => {
      beforeEach(() => {
        existsResults.matches = []
      })

      it('returns the bill run type of the session formatted for display', async () => {
        const result = await CheckPresenter.go(session, existsResults)

        expect(result.billRunType).to.equal('Annual')
      })
    })

    describe('when there is an existing blocking bill run', () => {
      beforeEach(() => {
        // NOTE: We wouldn't expect a two-part tariff bill run to block an annual, but we set it to something different
        // to demonstrate that it is using the existing bill run's batch type when it is present
        existsResults.matches[0].batchType = 'two_part_tariff'
      })

      it('returns its bill run type formatted for display', async () => {
        const result = await CheckPresenter.go(session, existsResults)

        expect(result.billRunType).to.equal('Two-part tariff')
      })
    })
  })

  describe('the "chargeScheme" property', () => {
    describe('when there is no existing blocking bill run', () => {
      beforeEach(() => {
        existsResults.matches = []
      })

      describe('and the "toFinancialYearEnding" has been determined as greater than 2022', () => {
        it('returns the "Current"', async () => {
          const result = await CheckPresenter.go(session, existsResults)

          expect(result.chargeScheme).to.equal('Current')
        })
      })

      describe('and the "toFinancialYearEnding" has been determined as equal to or less than 2022', () => {
        beforeEach(() => {
          existsResults.toFinancialYearEnding = 2022
        })

        it('returns the "Old"', async () => {
          const result = await CheckPresenter.go(session, existsResults)

          expect(result.chargeScheme).to.equal('Old')
        })
      })
    })

    describe('when there is an existing blocking bill run', () => {
      beforeEach(() => {
        existsResults.matches[0].scheme = 'alcs'
      })

      it('returns its scheme formatted for display', async () => {
        const result = await CheckPresenter.go(session, existsResults)

        expect(result.chargeScheme).to.equal('Old')
      })
    })
  })

  describe('the "dateCreated" property', () => {
    describe('when there is no existing blocking bill run', () => {
      beforeEach(() => {
        existsResults.matches = []
      })

      it('returns null', async () => {
        const result = await CheckPresenter.go(session, existsResults)

        expect(result.dateCreated).to.be.null()
      })
    })

    describe('when there is an existing blocking bill run', () => {
      it('returns its "created at" date', async () => {
        const result = await CheckPresenter.go(session, existsResults)

        expect(result.dateCreated).to.equal('1 May 2024')
      })
    })
  })

  describe('the "pageTitle" property', () => {
    describe('when there is no existing blocking bill run', () => {
      beforeEach(() => {
        existsResults.matches = []
      })

      describe('and the "toFinancialYearEnding" has been determined', () => {
        it('returns "Check the bill run to be created"', async () => {
          const result = await CheckPresenter.go(session, existsResults)

          expect(result.pageTitle).to.equal('Check the bill run to be created')
        })
      })

      describe('and the "toFinancialYearEnding" has been determined as 0 (non-prod edge case for supplementary)', () => {
        beforeEach(() => {
          existsResults.toFinancialYearEnding = 0
        })

        it('returns "Cannot create bill run"', async () => {
          const result = await CheckPresenter.go(session, existsResults)

          expect(result.pageTitle).to.equal('Cannot create bill run')
        })
      })
    })

    describe('when there is an existing blocking bill run', () => {
      it('returns "This bill run already exists"', async () => {
        const result = await CheckPresenter.go(session, existsResults)

        expect(result.pageTitle).to.equal('This bill run already exists')
      })
    })
  })

  describe('the "regionName" property', () => {
    describe('when there is no existing blocking bill run', () => {
      beforeEach(() => {
        existsResults.matches = []
      })

      it("returns the selected region's name", async () => {
        const result = await CheckPresenter.go(session, existsResults)

        expect(result.regionName).to.equal('Stormlands')
      })
    })

    describe('when there is an existing blocking bill run', () => {
      beforeEach(() => {
        // NOTE: It would never happen that the blocking bill run would be for a different region, but we set it to
        // something different to demonstrate that it is using the existing bill run's region when it is present
        existsResults.matches[0].region.displayName = 'Avalon'
      })

      it("returns its region's name", async () => {
        const result = await CheckPresenter.go(session, existsResults)

        expect(result.regionName).to.equal('Avalon')
      })
    })
  })

  describe('the "warningMessage" property', () => {
    describe('when there is no existing blocking bill run', () => {
      beforeEach(() => {
        existsResults.matches = []
      })

      it('returns null', async () => {
        const result = await CheckPresenter.go(session, existsResults)

        expect(result.warningMessage).to.be.null()
      })
    })

    describe('when there is an existing blocking bill run', () => {
      describe('and its batch type is "supplementary"', () => {
        beforeEach(() => {
          existsResults.matches[0].batchType = 'supplementary'
        })

        it('returns the "You need to confirm or cancel this [..]" message', async () => {
          const result = await CheckPresenter.go(session, existsResults)

          expect(result.warningMessage).to.equal(
            'You need to confirm or cancel this bill run before you can create a new one'
          )
        })
      })

      describe('and its batch type is not "supplementary"', () => {
        beforeEach(() => {
          existsResults.matches[0].batchType = 'two_part_tariff'
        })

        describe('and its status is "sent"', () => {
          beforeEach(() => {
            existsResults.matches[0].status = 'sent'
          })

          it('returns the "You can only have one [..]" message', async () => {
            const result = await CheckPresenter.go(session, existsResults)

            expect(result.warningMessage).to.equal(
              'You can only have one Two-part tariff bill run per region in a financial year'
            )
          })
        })

        describe('and its status is not "sent"', () => {
          beforeEach(() => {
            existsResults.matches[0].status = 'ready'
          })

          it('returns the "You need to cancel this [..]" message', async () => {
            const result = await CheckPresenter.go(session, existsResults)

            expect(result.warningMessage).to.equal('You need to cancel this bill run before you can create a new one')
          })
        })
      })
    })
  })
})
