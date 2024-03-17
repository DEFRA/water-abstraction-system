'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../../support/database.js')
const { determineCurrentFinancialYear } = require('../../../../app/lib/general.lib.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Things we need to stub
const DetermineBlockingBillRunService = require('../../../../app/services/bill-runs/setup/determine-blocking-bill-run.service.js')

// Thing under test
const ExistsService = require('../../../../app/services/bill-runs/setup/exists.service.js')

describe('Bill Runs Setup Exists service', () => {
  let currentFinancialEndYear
  let setupSession

  beforeEach(async () => {
    await DatabaseSupport.clean()

    const { endDate } = determineCurrentFinancialYear()
    currentFinancialEndYear = endDate.getFullYear()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('and the user is intending to create a two-part tariff bill run', () => {
      beforeEach(async () => {
        setupSession = await SessionHelper.add({
          data: {
            type: 'two_part_tariff',
            region: '19a027c6-4aad-47d3-80e3-3917a4579a5b',
            year: '2022',
            season: 'summer'
          }
        })
      })

      describe('and no matching bill runs exist', () => {
        beforeEach(async () => {
          Sinon.stub(DetermineBlockingBillRunService, 'go').resolves([])
        })

        it("returns an object with an empty 'matchResults:', a null 'pageData:' property and year to use is as selected", async () => {
          const result = await ExistsService.go(setupSession.id)

          const { matchResults, pageData, session, yearToUse } = result

          expect(matchResults).to.be.empty()
          expect(pageData).to.be.null()
          expect(session).to.equal(session)
          expect(yearToUse).to.equal(2022)
        })
      })

      describe('and a matching bill run exists', () => {
        beforeEach(async () => {
          Sinon.stub(DetermineBlockingBillRunService, 'go').resolves([{
            id: 'dfbbc7ac-b15b-483a-afcf-a7c01ac377d1',
            batchType: 'two_part_tariff',
            billRunNumber: 12345,
            createdAt: new Date('2022-05-01'),
            region: { id: '19a027c6-4aad-47d3-80e3-3917a4579a5b', displayName: 'stormlands' },
            scheme: 'alcs',
            status: 'sent',
            summer: true,
            toFinancialYearEnding: 2022
          }])
        })

        it("returns an object with 'matchResults:' set, a populated 'pageData:' property and year to use is as selected", async () => {
          const result = await ExistsService.go(setupSession.id)

          const { matchResults, pageData, session, yearToUse } = result

          expect(matchResults[0].id).to.equal('dfbbc7ac-b15b-483a-afcf-a7c01ac377d1')
          expect(pageData.billRunId).to.be.equal('dfbbc7ac-b15b-483a-afcf-a7c01ac377d1')
          expect(session).to.equal(session)
          expect(yearToUse).to.equal(2022)
        })
      })
    })

    describe('and the user is intending to create an annual bill run', () => {
      beforeEach(async () => {
        // NOTE: Just to prove the service can handle it, we imagine the user went down the route of a 2PT bill run,
        // then changed their mind and went back and selected supplementary. Year and season are now irrelevant and
        // leaving them in confirms this.
        setupSession = await SessionHelper.add({
          data: {
            type: 'annual',
            region: '19a027c6-4aad-47d3-80e3-3917a4579a5b',
            year: '2022',
            season: 'summer'
          }
        })
      })

      describe('and no matching bill runs exist', () => {
        beforeEach(async () => {
          Sinon.stub(DetermineBlockingBillRunService, 'go').resolves([])
        })

        it("returns an object with an empty 'matchResults:', a null 'pageData:' property and year to use is the current financial year end", async () => {
          const result = await ExistsService.go(setupSession.id)

          const { matchResults, pageData, session, yearToUse } = result

          expect(matchResults).to.be.empty()
          expect(pageData).to.be.null()
          expect(session).to.equal(session)
          expect(yearToUse).to.equal(currentFinancialEndYear)
        })
      })

      describe('and a matching bill run exists', () => {
        beforeEach(async () => {
          Sinon.stub(DetermineBlockingBillRunService, 'go').resolves([{
            id: '5612815f-9f67-4ac1-b697-d9ab7789274c',
            batchType: 'annual',
            billRunNumber: 12345,
            createdAt: new Date('2023-05-01'),
            region: { id: '19a027c6-4aad-47d3-80e3-3917a4579a5b', displayName: 'stormlands' },
            scheme: 'sroc',
            status: 'sent',
            summer: false,
            toFinancialYearEnding: 2024
          }])
        })

        it("returns an object with 'matchResults:' set, a populated 'pageData:' property and year to use is as selected", async () => {
          const result = await ExistsService.go(setupSession.id)

          const { matchResults, pageData, session, yearToUse } = result

          expect(matchResults[0].id).to.equal('5612815f-9f67-4ac1-b697-d9ab7789274c')
          expect(pageData.billRunId).to.be.equal('5612815f-9f67-4ac1-b697-d9ab7789274c')
          expect(session).to.equal(session)
          expect(yearToUse).to.equal(currentFinancialEndYear)
        })
      })
    })

    describe('and the user is intending to create a supplementary bill run', () => {
      beforeEach(async () => {
        // NOTE: Just to prove the service can handle it, we imagine the user went down the route of a 2PT bill run,
        // then changed their mind and went back and selected supplementary. Year and season are now irrelevant and
        // leaving them in confirms this.
        setupSession = await SessionHelper.add({
          data: {
            type: 'supplementary',
            region: '19a027c6-4aad-47d3-80e3-3917a4579a5b',
            year: '2022',
            season: 'summer'
          }
        })
      })

      describe('and no matching bill runs exist', () => {
        beforeEach(async () => {
          Sinon.stub(DetermineBlockingBillRunService, 'go').resolves([])
        })

        it("returns an object with an empty 'matchResults:', a null 'pageData:' property and year to use is the current financial year end", async () => {
          const result = await ExistsService.go(setupSession.id)

          const { matchResults, pageData, session, yearToUse } = result

          expect(matchResults).to.be.empty()
          expect(pageData).to.be.null()
          expect(session).to.equal(session)
          expect(yearToUse).to.equal(currentFinancialEndYear)
        })
      })

      describe('and one matching bill run exists', () => {
        beforeEach(async () => {
          Sinon.stub(DetermineBlockingBillRunService, 'go').resolves([{
            id: '7b8a518b-ee0c-4c12-acfe-3b99f99d4c53',
            batchType: 'supplementary',
            billRunNumber: 12345,
            createdAt: new Date('2023-05-01'),
            region: { id: '19a027c6-4aad-47d3-80e3-3917a4579a5b', displayName: 'stormlands' },
            scheme: 'sroc',
            status: 'ready',
            summer: false,
            toFinancialYearEnding: 2024
          }])
        })

        // NOTE: If there is only one match for supplementary we don't populate the pageData because we won't show the
        // exists page. If there is only one match, then we _can_ generate the other schema's bill run
        it("returns an object with 'matchResults:' set, a null 'pageData:' property and year to use is the current financial year end", async () => {
          const result = await ExistsService.go(setupSession.id)

          const { matchResults, pageData, session, yearToUse } = result

          expect(matchResults[0].id).to.equal('7b8a518b-ee0c-4c12-acfe-3b99f99d4c53')
          expect(pageData).to.be.null()
          expect(session).to.equal(session)
          expect(yearToUse).to.equal(currentFinancialEndYear)
        })
      })

      describe('and two matching bill runs exist', () => {
        beforeEach(async () => {
          Sinon.stub(DetermineBlockingBillRunService, 'go').resolves([
            {
              id: '7b8a518b-ee0c-4c12-acfe-3b99f99d4c53',
              batchType: 'supplementary',
              billRunNumber: 12345,
              createdAt: new Date('2023-05-01'),
              region: { id: '19a027c6-4aad-47d3-80e3-3917a4579a5b', displayName: 'stormlands' },
              scheme: 'sroc',
              status: 'ready',
              summer: false,
              toFinancialYearEnding: 2024
            },
            {
              id: '5be625b3-a954-465d-8ab8-cde1b2f052ce',
              batchType: 'supplementary',
              billRunNumber: 12345,
              createdAt: new Date('2023-05-01'),
              region: { id: '19a027c6-4aad-47d3-80e3-3917a4579a5b', displayName: 'stormlands' },
              scheme: 'presroc',
              status: 'ready',
              summer: false,
              toFinancialYearEnding: 2024
            }
          ])
        })

        // NOTE: If there are 2 matches for supplementary then we populate the pageData for the first match. TBH we
        // don't have a solution that can show both matches. But eventually we will only be generating SROC bill runs so
        // this problem will go away!
        it("returns an object with 'matchResults:' set, a populated 'pageData:' property and year to use is the current financial year end", async () => {
          const result = await ExistsService.go(setupSession.id)

          const { matchResults, pageData, session, yearToUse } = result

          expect(['7b8a518b-ee0c-4c12-acfe-3b99f99d4c53', '5be625b3-a954-465d-8ab8-cde1b2f052ce']).includes(matchResults[0].id)
          expect(['7b8a518b-ee0c-4c12-acfe-3b99f99d4c53', '5be625b3-a954-465d-8ab8-cde1b2f052ce']).includes(matchResults[1].id)
          expect(pageData.billRunId).to.equal(matchResults[0].id)
          expect(session).to.equal(session)
          expect(yearToUse).to.equal(currentFinancialEndYear)
        })
      })
    })
  })
})
