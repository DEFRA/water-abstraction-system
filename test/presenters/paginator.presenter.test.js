'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const DatabaseConfig = require('../../config/database.config.js')

// Thing under test
const PaginatorPresenter = require('../../app/presenters/paginator.presenter.js')

describe('Paginator Presenter', () => {
  const path = '/system/bill-runs'

  // NOTE: We set the number of records according to the default page size we use in these tests (50) to get the number
  // of pages we expect
  let numberOfRecords
  let queryArgs
  let selectedPage

  before(async () => {
    // NOTE: We set the default page so we have control over how we expect the paginator to 'page up' our results. But
    // it also allows us to set it to something different to the current default of 25 to confirm changing the default
    // won't break the presenter
    Sinon.replace(DatabaseConfig, 'defaultPageSize', 50)
  })

  after(() => {
    Sinon.restore()
  })

  describe('when no pagination is needed', () => {
    describe('for 1 page', () => {
      beforeEach(() => {
        numberOfRecords = 1
      })

      it('returns just the number of pages calculated (no pagination component returned)', () => {
        const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path)

        expect(result).equal({ numberOfPages: 1 })
      })
    })
  })

  describe('when pagination is needed', () => {
    describe('and there are no query arguments', () => {
      describe('for 2 pages', () => {
        beforeEach(() => {
          numberOfRecords = 75
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          it('returns [1] 2 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path)

            expect(result).equal({
              numberOfPages: 2,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: true },
                  { number: 2, visuallyHiddenText: 'Page 2', href: '/system/bill-runs?page=2', current: false }
                ],
                next: { href: '/system/bill-runs?page=2' }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 2
          })

          it('returns <- Previous 1 [2]', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path)

            expect(result).equal({
              numberOfPages: 2,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  { number: 2, visuallyHiddenText: 'Page 2', href: '/system/bill-runs?page=2', current: true }
                ],
                previous: { href: '/system/bill-runs?page=1' }
              }
            })
          })
        })
      })

      describe('for 3 pages', () => {
        beforeEach(() => {
          numberOfRecords = 125
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          it('returns [1] 2  3 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path)

            expect(result).equal({
              numberOfPages: 3,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: true },
                  { number: 2, visuallyHiddenText: 'Page 2', href: '/system/bill-runs?page=2', current: false },
                  { number: 3, visuallyHiddenText: 'Page 3', href: '/system/bill-runs?page=3', current: false }
                ],
                next: { href: '/system/bill-runs?page=2' }
              }
            })
          })
        })

        describe('and page 2 is selected', () => {
          beforeEach(() => {
            selectedPage = 2
          })

          it('returns <- Previous 1 [2] 3 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path)

            expect(result).equal({
              numberOfPages: 3,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  { number: 2, visuallyHiddenText: 'Page 2', href: '/system/bill-runs?page=2', current: true },
                  { number: 3, visuallyHiddenText: 'Page 3', href: '/system/bill-runs?page=3', current: false }
                ],
                next: { href: '/system/bill-runs?page=3' },
                previous: { href: '/system/bill-runs?page=1' }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 3
          })

          it('returns <- Previous 1 2 [3]', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path)

            expect(result).equal({
              numberOfPages: 3,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  { number: 2, visuallyHiddenText: 'Page 2', href: '/system/bill-runs?page=2', current: false },
                  { number: 3, visuallyHiddenText: 'Page 3', href: '/system/bill-runs?page=3', current: true }
                ],
                previous: { href: '/system/bill-runs?page=2' }
              }
            })
          })
        })
      })

      describe('for 4 pages', () => {
        beforeEach(() => {
          numberOfRecords = 175
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          it('returns [1] 2 3 4 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path)

            expect(result).equal({
              numberOfPages: 4,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: true },
                  { number: 2, visuallyHiddenText: 'Page 2', href: '/system/bill-runs?page=2', current: false },
                  { number: 3, visuallyHiddenText: 'Page 3', href: '/system/bill-runs?page=3', current: false },
                  { number: 4, visuallyHiddenText: 'Page 4', href: '/system/bill-runs?page=4', current: false }
                ],
                next: { href: '/system/bill-runs?page=2' }
              }
            })
          })
        })

        describe('and page 2 is selected', () => {
          beforeEach(() => {
            selectedPage = 2
          })

          it('returns <- Previous 1 [2] 3 4 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path)

            expect(result).equal({
              numberOfPages: 4,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  { number: 2, visuallyHiddenText: 'Page 2', href: '/system/bill-runs?page=2', current: true },
                  { number: 3, visuallyHiddenText: 'Page 3', href: '/system/bill-runs?page=3', current: false },
                  { number: 4, visuallyHiddenText: 'Page 4', href: '/system/bill-runs?page=4', current: false }
                ],
                next: { href: '/system/bill-runs?page=3' },
                previous: { href: '/system/bill-runs?page=1' }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 4
          })

          it('returns <- Previous 1 2 3 [4]', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path)

            expect(result).equal({
              numberOfPages: 4,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  { number: 2, visuallyHiddenText: 'Page 2', href: '/system/bill-runs?page=2', current: false },
                  { number: 3, visuallyHiddenText: 'Page 3', href: '/system/bill-runs?page=3', current: false },
                  { number: 4, visuallyHiddenText: 'Page 4', href: '/system/bill-runs?page=4', current: true }
                ],
                previous: { href: '/system/bill-runs?page=3' }
              }
            })
          })
        })
      })

      describe('for 5 pages', () => {
        beforeEach(() => {
          numberOfRecords = 225
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          it('returns [1] 2 3 4 5 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path)

            expect(result).equal({
              numberOfPages: 5,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: true },
                  { number: 2, visuallyHiddenText: 'Page 2', href: '/system/bill-runs?page=2', current: false },
                  { number: 3, visuallyHiddenText: 'Page 3', href: '/system/bill-runs?page=3', current: false },
                  { number: 4, visuallyHiddenText: 'Page 4', href: '/system/bill-runs?page=4', current: false },
                  { number: 5, visuallyHiddenText: 'Page 5', href: '/system/bill-runs?page=5', current: false }
                ],
                next: { href: '/system/bill-runs?page=2' }
              }
            })
          })
        })

        describe('and page 3 is selected', () => {
          beforeEach(() => {
            selectedPage = 3
          })

          it('returns <- Previous 1 2 [3] 4 5 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path)

            expect(result).equal({
              numberOfPages: 5,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  { number: 2, visuallyHiddenText: 'Page 2', href: '/system/bill-runs?page=2', current: false },
                  { number: 3, visuallyHiddenText: 'Page 3', href: '/system/bill-runs?page=3', current: true },
                  { number: 4, visuallyHiddenText: 'Page 4', href: '/system/bill-runs?page=4', current: false },
                  { number: 5, visuallyHiddenText: 'Page 5', href: '/system/bill-runs?page=5', current: false }
                ],
                next: { href: '/system/bill-runs?page=4' },
                previous: { href: '/system/bill-runs?page=2' }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 5
          })

          it('returns <- Previous 1 2 3 4 [5]', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path)

            expect(result).equal({
              numberOfPages: 5,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  { number: 2, visuallyHiddenText: 'Page 2', href: '/system/bill-runs?page=2', current: false },
                  { number: 3, visuallyHiddenText: 'Page 3', href: '/system/bill-runs?page=3', current: false },
                  { number: 4, visuallyHiddenText: 'Page 4', href: '/system/bill-runs?page=4', current: false },
                  { number: 5, visuallyHiddenText: 'Page 5', href: '/system/bill-runs?page=5', current: true }
                ],
                previous: { href: '/system/bill-runs?page=4' }
              }
            })
          })
        })
      })

      describe('for 6 pages', () => {
        beforeEach(() => {
          numberOfRecords = 275
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          it('returns [1] 2 3 4 5 6 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path)

            expect(result).equal({
              numberOfPages: 6,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: true },
                  { number: 2, visuallyHiddenText: 'Page 2', href: '/system/bill-runs?page=2', current: false },
                  { number: 3, visuallyHiddenText: 'Page 3', href: '/system/bill-runs?page=3', current: false },
                  { number: 4, visuallyHiddenText: 'Page 4', href: '/system/bill-runs?page=4', current: false },
                  { number: 5, visuallyHiddenText: 'Page 5', href: '/system/bill-runs?page=5', current: false },
                  { number: 6, visuallyHiddenText: 'Page 6', href: '/system/bill-runs?page=6', current: false }
                ],
                next: { href: '/system/bill-runs?page=2' }
              }
            })
          })
        })

        describe('and page 3 is selected', () => {
          beforeEach(() => {
            selectedPage = 3
          })

          it('returns <- Previous 1 2 [3] 4 5 6 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path)

            expect(result).equal({
              numberOfPages: 6,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  { number: 2, visuallyHiddenText: 'Page 2', href: '/system/bill-runs?page=2', current: false },
                  { number: 3, visuallyHiddenText: 'Page 3', href: '/system/bill-runs?page=3', current: true },
                  { number: 4, visuallyHiddenText: 'Page 4', href: '/system/bill-runs?page=4', current: false },
                  { number: 5, visuallyHiddenText: 'Page 5', href: '/system/bill-runs?page=5', current: false },
                  { number: 6, visuallyHiddenText: 'Page 6', href: '/system/bill-runs?page=6', current: false }
                ],
                next: { href: '/system/bill-runs?page=4' },
                previous: { href: '/system/bill-runs?page=2' }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 6
          })

          it('returns <- Previous 1 2 3 4 5 [6]', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path)

            expect(result).equal({
              numberOfPages: 6,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  { number: 2, visuallyHiddenText: 'Page 2', href: '/system/bill-runs?page=2', current: false },
                  { number: 3, visuallyHiddenText: 'Page 3', href: '/system/bill-runs?page=3', current: false },
                  { number: 4, visuallyHiddenText: 'Page 4', href: '/system/bill-runs?page=4', current: false },
                  { number: 5, visuallyHiddenText: 'Page 5', href: '/system/bill-runs?page=5', current: false },
                  { number: 6, visuallyHiddenText: 'Page 6', href: '/system/bill-runs?page=6', current: true }
                ],
                previous: { href: '/system/bill-runs?page=5' }
              }
            })
          })
        })
      })

      describe('for 7 pages', () => {
        beforeEach(() => {
          numberOfRecords = 325
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          it('returns [1] 2 3 4 5 6 7 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path)

            expect(result).equal({
              numberOfPages: 7,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: true },
                  { number: 2, visuallyHiddenText: 'Page 2', href: '/system/bill-runs?page=2', current: false },
                  { number: 3, visuallyHiddenText: 'Page 3', href: '/system/bill-runs?page=3', current: false },
                  { number: 4, visuallyHiddenText: 'Page 4', href: '/system/bill-runs?page=4', current: false },
                  { number: 5, visuallyHiddenText: 'Page 5', href: '/system/bill-runs?page=5', current: false },
                  { number: 6, visuallyHiddenText: 'Page 6', href: '/system/bill-runs?page=6', current: false },
                  { number: 7, visuallyHiddenText: 'Page 7', href: '/system/bill-runs?page=7', current: false }
                ],
                next: { href: '/system/bill-runs?page=2' }
              }
            })
          })
        })

        describe('and page 4 is selected', () => {
          beforeEach(() => {
            selectedPage = 4
          })

          it('returns <- Previous 1 2 3 [4] 5 6 7 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path)

            expect(result).equal({
              numberOfPages: 7,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  { number: 2, visuallyHiddenText: 'Page 2', href: '/system/bill-runs?page=2', current: false },
                  { number: 3, visuallyHiddenText: 'Page 3', href: '/system/bill-runs?page=3', current: false },
                  { number: 4, visuallyHiddenText: 'Page 4', href: '/system/bill-runs?page=4', current: true },
                  { number: 5, visuallyHiddenText: 'Page 5', href: '/system/bill-runs?page=5', current: false },
                  { number: 6, visuallyHiddenText: 'Page 6', href: '/system/bill-runs?page=6', current: false },
                  { number: 7, visuallyHiddenText: 'Page 7', href: '/system/bill-runs?page=7', current: false }
                ],
                next: { href: '/system/bill-runs?page=5' },
                previous: { href: '/system/bill-runs?page=3' }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 7
          })

          it('returns <- Previous 1 2 3 4 5 6 [7]', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path)

            expect(result).equal({
              numberOfPages: 7,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  { number: 2, visuallyHiddenText: 'Page 2', href: '/system/bill-runs?page=2', current: false },
                  { number: 3, visuallyHiddenText: 'Page 3', href: '/system/bill-runs?page=3', current: false },
                  { number: 4, visuallyHiddenText: 'Page 4', href: '/system/bill-runs?page=4', current: false },
                  { number: 5, visuallyHiddenText: 'Page 5', href: '/system/bill-runs?page=5', current: false },
                  { number: 6, visuallyHiddenText: 'Page 6', href: '/system/bill-runs?page=6', current: false },
                  { number: 7, visuallyHiddenText: 'Page 7', href: '/system/bill-runs?page=7', current: true }
                ],
                previous: { href: '/system/bill-runs?page=6' }
              }
            })
          })
        })
      })

      describe('for 8 pages', () => {
        beforeEach(() => {
          numberOfRecords = 375
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          it('returns [1] 2 3 4 5 .. 8 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path)

            expect(result).equal({
              numberOfPages: 8,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: true },
                  { number: 2, visuallyHiddenText: 'Page 2', href: '/system/bill-runs?page=2', current: false },
                  { number: 3, visuallyHiddenText: 'Page 3', href: '/system/bill-runs?page=3', current: false },
                  { number: 4, visuallyHiddenText: 'Page 4', href: '/system/bill-runs?page=4', current: false },
                  { number: 5, visuallyHiddenText: 'Page 5', href: '/system/bill-runs?page=5', current: false },
                  { ellipsis: true },
                  { number: 8, visuallyHiddenText: 'Page 8', href: '/system/bill-runs?page=8', current: false }
                ],
                next: { href: '/system/bill-runs?page=2' }
              }
            })
          })
        })

        describe('and page 4 is selected', () => {
          beforeEach(() => {
            selectedPage = 4
          })

          it('returns <- Previous 1 2 3 [4] 5 .. 8 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path)

            expect(result).equal({
              numberOfPages: 8,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  { number: 2, visuallyHiddenText: 'Page 2', href: '/system/bill-runs?page=2', current: false },
                  { number: 3, visuallyHiddenText: 'Page 3', href: '/system/bill-runs?page=3', current: false },
                  { number: 4, visuallyHiddenText: 'Page 4', href: '/system/bill-runs?page=4', current: true },
                  { number: 5, visuallyHiddenText: 'Page 5', href: '/system/bill-runs?page=5', current: false },
                  { ellipsis: true },
                  { number: 8, visuallyHiddenText: 'Page 8', href: '/system/bill-runs?page=8', current: false }
                ],
                next: { href: '/system/bill-runs?page=5' },
                previous: { href: '/system/bill-runs?page=3' }
              }
            })
          })
        })

        describe('and page 5 is selected', () => {
          beforeEach(() => {
            selectedPage = 5
          })

          it('returns <- Previous 1 .. 4 [5] 6 7 8 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path)

            expect(result).equal({
              numberOfPages: 8,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  { ellipsis: true },
                  { number: 4, visuallyHiddenText: 'Page 4', href: '/system/bill-runs?page=4', current: false },
                  { number: 5, visuallyHiddenText: 'Page 5', href: '/system/bill-runs?page=5', current: true },
                  { number: 6, visuallyHiddenText: 'Page 6', href: '/system/bill-runs?page=6', current: false },
                  { number: 7, visuallyHiddenText: 'Page 7', href: '/system/bill-runs?page=7', current: false },
                  { number: 8, visuallyHiddenText: 'Page 8', href: '/system/bill-runs?page=8', current: false }
                ],
                next: { href: '/system/bill-runs?page=6' },
                previous: { href: '/system/bill-runs?page=4' }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 8
          })

          it('returns <- Previous 1 .. 4 5 6 7 [8]', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path)

            expect(result).equal({
              numberOfPages: 8,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  { ellipsis: true },
                  { number: 4, visuallyHiddenText: 'Page 4', href: '/system/bill-runs?page=4', current: false },
                  { number: 5, visuallyHiddenText: 'Page 5', href: '/system/bill-runs?page=5', current: false },
                  { number: 6, visuallyHiddenText: 'Page 6', href: '/system/bill-runs?page=6', current: false },
                  { number: 7, visuallyHiddenText: 'Page 7', href: '/system/bill-runs?page=7', current: false },
                  { number: 8, visuallyHiddenText: 'Page 8', href: '/system/bill-runs?page=8', current: true }
                ],
                previous: { href: '/system/bill-runs?page=7' }
              }
            })
          })
        })
      })

      describe('for 9 pages', () => {
        beforeEach(() => {
          numberOfRecords = 425
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          it('returns [1] 2 3 4 5 .. 9 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path)

            expect(result).equal({
              numberOfPages: 9,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: true },
                  { number: 2, visuallyHiddenText: 'Page 2', href: '/system/bill-runs?page=2', current: false },
                  { number: 3, visuallyHiddenText: 'Page 3', href: '/system/bill-runs?page=3', current: false },
                  { number: 4, visuallyHiddenText: 'Page 4', href: '/system/bill-runs?page=4', current: false },
                  { number: 5, visuallyHiddenText: 'Page 5', href: '/system/bill-runs?page=5', current: false },
                  { ellipsis: true },
                  { number: 9, visuallyHiddenText: 'Page 9', href: '/system/bill-runs?page=9', current: false }
                ],
                next: { href: '/system/bill-runs?page=2' }
              }
            })
          })
        })

        describe('and page 4 is selected', () => {
          beforeEach(() => {
            selectedPage = 4
          })

          it('returns <- Previous 1 2 3 [4] 5 .. 9 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path)

            expect(result).equal({
              numberOfPages: 9,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  { number: 2, visuallyHiddenText: 'Page 2', href: '/system/bill-runs?page=2', current: false },
                  { number: 3, visuallyHiddenText: 'Page 3', href: '/system/bill-runs?page=3', current: false },
                  { number: 4, visuallyHiddenText: 'Page 4', href: '/system/bill-runs?page=4', current: true },
                  { number: 5, visuallyHiddenText: 'Page 5', href: '/system/bill-runs?page=5', current: false },
                  { ellipsis: true },
                  { number: 9, visuallyHiddenText: 'Page 9', href: '/system/bill-runs?page=9', current: false }
                ],
                next: { href: '/system/bill-runs?page=5' },
                previous: { href: '/system/bill-runs?page=3' }
              }
            })
          })
        })

        describe('and page 5 is selected', () => {
          beforeEach(() => {
            selectedPage = 5
          })

          it('returns <- Previous 1 .. 4 [5] 6 .. 9 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path)

            expect(result).equal({
              numberOfPages: 9,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  { ellipsis: true },
                  { number: 4, visuallyHiddenText: 'Page 4', href: '/system/bill-runs?page=4', current: false },
                  { number: 5, visuallyHiddenText: 'Page 5', href: '/system/bill-runs?page=5', current: true },
                  { number: 6, visuallyHiddenText: 'Page 6', href: '/system/bill-runs?page=6', current: false },
                  { ellipsis: true },
                  { number: 9, visuallyHiddenText: 'Page 9', href: '/system/bill-runs?page=9', current: false }
                ],
                next: { href: '/system/bill-runs?page=6' },
                previous: { href: '/system/bill-runs?page=4' }
              }
            })
          })
        })

        describe('and page 6 is selected', () => {
          beforeEach(() => {
            selectedPage = 6
          })

          it('returns <- Previous 1 .. 5 [6] 7 8 9 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path)

            expect(result).equal({
              numberOfPages: 9,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  { ellipsis: true },
                  { number: 5, visuallyHiddenText: 'Page 5', href: '/system/bill-runs?page=5', current: false },
                  { number: 6, visuallyHiddenText: 'Page 6', href: '/system/bill-runs?page=6', current: true },
                  { number: 7, visuallyHiddenText: 'Page 7', href: '/system/bill-runs?page=7', current: false },
                  { number: 8, visuallyHiddenText: 'Page 8', href: '/system/bill-runs?page=8', current: false },
                  { number: 9, visuallyHiddenText: 'Page 9', href: '/system/bill-runs?page=9', current: false }
                ],
                next: { href: '/system/bill-runs?page=7' },
                previous: { href: '/system/bill-runs?page=5' }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 9
          })

          it('returns <- Previous 1 .. 5 6 7 8 [9]', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path)

            expect(result).equal({
              numberOfPages: 9,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  { ellipsis: true },
                  { number: 5, visuallyHiddenText: 'Page 5', href: '/system/bill-runs?page=5', current: false },
                  { number: 6, visuallyHiddenText: 'Page 6', href: '/system/bill-runs?page=6', current: false },
                  { number: 7, visuallyHiddenText: 'Page 7', href: '/system/bill-runs?page=7', current: false },
                  { number: 8, visuallyHiddenText: 'Page 8', href: '/system/bill-runs?page=8', current: false },
                  { number: 9, visuallyHiddenText: 'Page 9', href: '/system/bill-runs?page=9', current: true }
                ],
                previous: { href: '/system/bill-runs?page=8' }
              }
            })
          })
        })
      })

      describe('for 100 pages', () => {
        beforeEach(() => {
          numberOfRecords = 4975
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          it('returns [1] 2 3 4 5 .. 100 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path)

            expect(result).equal({
              numberOfPages: 100,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: true },
                  { number: 2, visuallyHiddenText: 'Page 2', href: '/system/bill-runs?page=2', current: false },
                  { number: 3, visuallyHiddenText: 'Page 3', href: '/system/bill-runs?page=3', current: false },
                  { number: 4, visuallyHiddenText: 'Page 4', href: '/system/bill-runs?page=4', current: false },
                  { number: 5, visuallyHiddenText: 'Page 5', href: '/system/bill-runs?page=5', current: false },
                  { ellipsis: true },
                  { number: 100, visuallyHiddenText: 'Page 100', href: '/system/bill-runs?page=100', current: false }
                ],
                next: { href: '/system/bill-runs?page=2' }
              }
            })
          })
        })

        describe('and page 4 is selected', () => {
          beforeEach(() => {
            selectedPage = 4
          })

          it('returns <- Previous 1 2 3 [4] 5 .. 100 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path)

            expect(result).equal({
              numberOfPages: 100,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  { number: 2, visuallyHiddenText: 'Page 2', href: '/system/bill-runs?page=2', current: false },
                  { number: 3, visuallyHiddenText: 'Page 3', href: '/system/bill-runs?page=3', current: false },
                  { number: 4, visuallyHiddenText: 'Page 4', href: '/system/bill-runs?page=4', current: true },
                  { number: 5, visuallyHiddenText: 'Page 5', href: '/system/bill-runs?page=5', current: false },
                  { ellipsis: true },
                  { number: 100, visuallyHiddenText: 'Page 100', href: '/system/bill-runs?page=100', current: false }
                ],
                next: { href: '/system/bill-runs?page=5' },
                previous: { href: '/system/bill-runs?page=3' }
              }
            })
          })
        })

        describe('and page 49 is selected', () => {
          beforeEach(() => {
            selectedPage = 49
          })

          it('returns <- Previous 1 .. 48 [49] 50 .. 100 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path)

            expect(result).equal({
              numberOfPages: 100,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  { ellipsis: true },
                  { number: 48, visuallyHiddenText: 'Page 48', href: '/system/bill-runs?page=48', current: false },
                  { number: 49, visuallyHiddenText: 'Page 49', href: '/system/bill-runs?page=49', current: true },
                  { number: 50, visuallyHiddenText: 'Page 50', href: '/system/bill-runs?page=50', current: false },
                  { ellipsis: true },
                  { number: 100, visuallyHiddenText: 'Page 100', href: '/system/bill-runs?page=100', current: false }
                ],
                next: { href: '/system/bill-runs?page=50' },
                previous: { href: '/system/bill-runs?page=48' }
              }
            })
          })
        })

        describe('and page 97 is selected', () => {
          beforeEach(() => {
            selectedPage = 97
          })

          it('returns <- Previous 1 .. 96 [97] 98 99 100 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path)

            expect(result).equal({
              numberOfPages: 100,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  { ellipsis: true },
                  { number: 96, visuallyHiddenText: 'Page 96', href: '/system/bill-runs?page=96', current: false },
                  { number: 97, visuallyHiddenText: 'Page 97', href: '/system/bill-runs?page=97', current: true },
                  { number: 98, visuallyHiddenText: 'Page 98', href: '/system/bill-runs?page=98', current: false },
                  { number: 99, visuallyHiddenText: 'Page 99', href: '/system/bill-runs?page=99', current: false },
                  { number: 100, visuallyHiddenText: 'Page 100', href: '/system/bill-runs?page=100', current: false }
                ],
                next: { href: '/system/bill-runs?page=98' },
                previous: { href: '/system/bill-runs?page=96' }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 100
          })

          it('returns <- Previous 1 .. 96 97 98 99 [100]', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path)

            expect(result).equal({
              numberOfPages: 100,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  { ellipsis: true },
                  { number: 96, visuallyHiddenText: 'Page 96', href: '/system/bill-runs?page=96', current: false },
                  { number: 97, visuallyHiddenText: 'Page 97', href: '/system/bill-runs?page=97', current: false },
                  { number: 98, visuallyHiddenText: 'Page 98', href: '/system/bill-runs?page=98', current: false },
                  { number: 99, visuallyHiddenText: 'Page 99', href: '/system/bill-runs?page=99', current: false },
                  { number: 100, visuallyHiddenText: 'Page 100', href: '/system/bill-runs?page=100', current: true }
                ],
                previous: { href: '/system/bill-runs?page=99' }
              }
            })
          })
        })
      })
    })

    describe('and there are query arguments', () => {
      beforeEach(() => {
        queryArgs = {
          'billing-account-id': 'c17c0a2b-6950-490b-8c3a-4dc9f01da368',
          'licence-id': '354fc0bd-0820-4611-a6af-874480bbae3b'
        }
      })

      describe('for 2 pages', () => {
        beforeEach(() => {
          numberOfRecords = 75
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          it('returns [1] 2 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path, queryArgs)

            expect(result).equal({
              numberOfPages: 2,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: true },
                  {
                    number: 2,
                    visuallyHiddenText: 'Page 2',
                    href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  }
                ],
                next: {
                  href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 2
          })

          it('returns <- Previous 1 [2]', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path, queryArgs)

            expect(result).equal({
              numberOfPages: 2,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  {
                    number: 2,
                    visuallyHiddenText: 'Page 2',
                    href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: true
                  }
                ],
                previous: {
                  href: '/system/bill-runs?page=1&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                }
              }
            })
          })
        })
      })

      describe('for 3 pages', () => {
        beforeEach(() => {
          numberOfRecords = 125
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          it('returns [1] 2  3 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path, queryArgs)

            expect(result).equal({
              numberOfPages: 3,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: true },
                  {
                    number: 2,
                    visuallyHiddenText: 'Page 2',
                    href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 3,
                    visuallyHiddenText: 'Page 3',
                    href: '/system/bill-runs?page=3&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  }
                ],
                next: {
                  href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                }
              }
            })
          })
        })

        describe('and page 2 is selected', () => {
          beforeEach(() => {
            selectedPage = 2
          })

          it('returns <- Previous 1 [2] 3 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path, queryArgs)

            expect(result).equal({
              numberOfPages: 3,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  {
                    number: 2,
                    visuallyHiddenText: 'Page 2',
                    href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: true
                  },
                  {
                    number: 3,
                    visuallyHiddenText: 'Page 3',
                    href: '/system/bill-runs?page=3&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  }
                ],
                next: {
                  href: '/system/bill-runs?page=3&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                },
                previous: {
                  href: '/system/bill-runs?page=1&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 3
          })

          it('returns <- Previous 1 2 [3]', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path, queryArgs)

            expect(result).equal({
              numberOfPages: 3,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  {
                    number: 2,
                    visuallyHiddenText: 'Page 2',
                    href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 3,
                    visuallyHiddenText: 'Page 3',
                    href: '/system/bill-runs?page=3&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: true
                  }
                ],
                previous: {
                  href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                }
              }
            })
          })
        })
      })

      describe('for 4 pages', () => {
        beforeEach(() => {
          numberOfRecords = 175
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          it('returns [1] 2 3 4 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path, queryArgs)

            expect(result).equal({
              numberOfPages: 4,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: true },
                  {
                    number: 2,
                    visuallyHiddenText: 'Page 2',
                    href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 3,
                    visuallyHiddenText: 'Page 3',
                    href: '/system/bill-runs?page=3&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 4,
                    visuallyHiddenText: 'Page 4',
                    href: '/system/bill-runs?page=4&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  }
                ],
                next: {
                  href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                }
              }
            })
          })
        })

        describe('and page 2 is selected', () => {
          beforeEach(() => {
            selectedPage = 2
          })

          it('returns <- Previous 1 [2] 3 4 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path, queryArgs)

            expect(result).equal({
              numberOfPages: 4,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  {
                    number: 2,
                    visuallyHiddenText: 'Page 2',
                    href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: true
                  },
                  {
                    number: 3,
                    visuallyHiddenText: 'Page 3',
                    href: '/system/bill-runs?page=3&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 4,
                    visuallyHiddenText: 'Page 4',
                    href: '/system/bill-runs?page=4&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  }
                ],
                next: {
                  href: '/system/bill-runs?page=3&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                },
                previous: {
                  href: '/system/bill-runs?page=1&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 4
          })

          it('returns <- Previous 1 2 3 [4]', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path, queryArgs)

            expect(result).equal({
              numberOfPages: 4,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  {
                    number: 2,
                    visuallyHiddenText: 'Page 2',
                    href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 3,
                    visuallyHiddenText: 'Page 3',
                    href: '/system/bill-runs?page=3&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 4,
                    visuallyHiddenText: 'Page 4',
                    href: '/system/bill-runs?page=4&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: true
                  }
                ],
                previous: {
                  href: '/system/bill-runs?page=3&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                }
              }
            })
          })
        })
      })

      describe('for 5 pages', () => {
        beforeEach(() => {
          numberOfRecords = 225
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          it('returns [1] 2 3 4 5 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path, queryArgs)

            expect(result).equal({
              numberOfPages: 5,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: true },
                  {
                    number: 2,
                    visuallyHiddenText: 'Page 2',
                    href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 3,
                    visuallyHiddenText: 'Page 3',
                    href: '/system/bill-runs?page=3&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 4,
                    visuallyHiddenText: 'Page 4',
                    href: '/system/bill-runs?page=4&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 5,
                    visuallyHiddenText: 'Page 5',
                    href: '/system/bill-runs?page=5&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  }
                ],
                next: {
                  href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                }
              }
            })
          })
        })

        describe('and page 3 is selected', () => {
          beforeEach(() => {
            selectedPage = 3
          })

          it('returns <- Previous 1 2 [3] 4 5 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path, queryArgs)

            expect(result).equal({
              numberOfPages: 5,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  {
                    number: 2,
                    visuallyHiddenText: 'Page 2',
                    href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 3,
                    visuallyHiddenText: 'Page 3',
                    href: '/system/bill-runs?page=3&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: true
                  },
                  {
                    number: 4,
                    visuallyHiddenText: 'Page 4',
                    href: '/system/bill-runs?page=4&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 5,
                    visuallyHiddenText: 'Page 5',
                    href: '/system/bill-runs?page=5&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  }
                ],
                next: {
                  href: '/system/bill-runs?page=4&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                },
                previous: {
                  href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 5
          })

          it('returns <- Previous 1 2 3 4 [5]', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path, queryArgs)

            expect(result).equal({
              numberOfPages: 5,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  {
                    number: 2,
                    visuallyHiddenText: 'Page 2',
                    href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 3,
                    visuallyHiddenText: 'Page 3',
                    href: '/system/bill-runs?page=3&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 4,
                    visuallyHiddenText: 'Page 4',
                    href: '/system/bill-runs?page=4&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 5,
                    visuallyHiddenText: 'Page 5',
                    href: '/system/bill-runs?page=5&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: true
                  }
                ],
                previous: {
                  href: '/system/bill-runs?page=4&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                }
              }
            })
          })
        })
      })

      describe('for 6 pages', () => {
        beforeEach(() => {
          numberOfRecords = 275
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          it('returns [1] 2 3 4 5 6 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path, queryArgs)

            expect(result).equal({
              numberOfPages: 6,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: true },
                  {
                    number: 2,
                    visuallyHiddenText: 'Page 2',
                    href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 3,
                    visuallyHiddenText: 'Page 3',
                    href: '/system/bill-runs?page=3&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 4,
                    visuallyHiddenText: 'Page 4',
                    href: '/system/bill-runs?page=4&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 5,
                    visuallyHiddenText: 'Page 5',
                    href: '/system/bill-runs?page=5&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 6,
                    visuallyHiddenText: 'Page 6',
                    href: '/system/bill-runs?page=6&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  }
                ],
                next: {
                  href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                }
              }
            })
          })
        })

        describe('and page 3 is selected', () => {
          beforeEach(() => {
            selectedPage = 3
          })

          it('returns <- Previous 1 2 [3] 4 5 6 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path, queryArgs)

            expect(result).equal({
              numberOfPages: 6,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  {
                    number: 2,
                    visuallyHiddenText: 'Page 2',
                    href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 3,
                    visuallyHiddenText: 'Page 3',
                    href: '/system/bill-runs?page=3&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: true
                  },
                  {
                    number: 4,
                    visuallyHiddenText: 'Page 4',
                    href: '/system/bill-runs?page=4&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 5,
                    visuallyHiddenText: 'Page 5',
                    href: '/system/bill-runs?page=5&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 6,
                    visuallyHiddenText: 'Page 6',
                    href: '/system/bill-runs?page=6&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  }
                ],
                next: {
                  href: '/system/bill-runs?page=4&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                },
                previous: {
                  href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 6
          })

          it('returns <- Previous 1 2 3 4 5 [6]', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path, queryArgs)

            expect(result).equal({
              numberOfPages: 6,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  {
                    number: 2,
                    visuallyHiddenText: 'Page 2',
                    href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 3,
                    visuallyHiddenText: 'Page 3',
                    href: '/system/bill-runs?page=3&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 4,
                    visuallyHiddenText: 'Page 4',
                    href: '/system/bill-runs?page=4&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 5,
                    visuallyHiddenText: 'Page 5',
                    href: '/system/bill-runs?page=5&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 6,
                    visuallyHiddenText: 'Page 6',
                    href: '/system/bill-runs?page=6&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: true
                  }
                ],
                previous: {
                  href: '/system/bill-runs?page=5&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                }
              }
            })
          })
        })
      })

      describe('for 7 pages', () => {
        beforeEach(() => {
          numberOfRecords = 325
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          it('returns [1] 2 3 4 5 6 7 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path, queryArgs)

            expect(result).equal({
              numberOfPages: 7,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: true },
                  {
                    number: 2,
                    visuallyHiddenText: 'Page 2',
                    href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 3,
                    visuallyHiddenText: 'Page 3',
                    href: '/system/bill-runs?page=3&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 4,
                    visuallyHiddenText: 'Page 4',
                    href: '/system/bill-runs?page=4&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 5,
                    visuallyHiddenText: 'Page 5',
                    href: '/system/bill-runs?page=5&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 6,
                    visuallyHiddenText: 'Page 6',
                    href: '/system/bill-runs?page=6&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 7,
                    visuallyHiddenText: 'Page 7',
                    href: '/system/bill-runs?page=7&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  }
                ],
                next: {
                  href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                }
              }
            })
          })
        })

        describe('and page 4 is selected', () => {
          beforeEach(() => {
            selectedPage = 4
          })

          it('returns <- Previous 1 2 3 [4] 5 6 7 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path, queryArgs)

            expect(result).equal({
              numberOfPages: 7,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  {
                    number: 2,
                    visuallyHiddenText: 'Page 2',
                    href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 3,
                    visuallyHiddenText: 'Page 3',
                    href: '/system/bill-runs?page=3&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 4,
                    visuallyHiddenText: 'Page 4',
                    href: '/system/bill-runs?page=4&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: true
                  },
                  {
                    number: 5,
                    visuallyHiddenText: 'Page 5',
                    href: '/system/bill-runs?page=5&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 6,
                    visuallyHiddenText: 'Page 6',
                    href: '/system/bill-runs?page=6&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 7,
                    visuallyHiddenText: 'Page 7',
                    href: '/system/bill-runs?page=7&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  }
                ],
                next: {
                  href: '/system/bill-runs?page=5&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                },
                previous: {
                  href: '/system/bill-runs?page=3&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 7
          })

          it('returns <- Previous 1 2 3 4 5 6 [7]', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path, queryArgs)

            expect(result).equal({
              numberOfPages: 7,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  {
                    number: 2,
                    visuallyHiddenText: 'Page 2',
                    href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 3,
                    visuallyHiddenText: 'Page 3',
                    href: '/system/bill-runs?page=3&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 4,
                    visuallyHiddenText: 'Page 4',
                    href: '/system/bill-runs?page=4&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 5,
                    visuallyHiddenText: 'Page 5',
                    href: '/system/bill-runs?page=5&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 6,
                    visuallyHiddenText: 'Page 6',
                    href: '/system/bill-runs?page=6&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 7,
                    visuallyHiddenText: 'Page 7',
                    href: '/system/bill-runs?page=7&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: true
                  }
                ],
                previous: {
                  href: '/system/bill-runs?page=6&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                }
              }
            })
          })
        })
      })

      describe('for 8 pages', () => {
        beforeEach(() => {
          numberOfRecords = 375
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          it('returns [1] 2 3 4 5 .. 8 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path, queryArgs)

            expect(result).equal({
              numberOfPages: 8,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: true },
                  {
                    number: 2,
                    visuallyHiddenText: 'Page 2',
                    href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 3,
                    visuallyHiddenText: 'Page 3',
                    href: '/system/bill-runs?page=3&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 4,
                    visuallyHiddenText: 'Page 4',
                    href: '/system/bill-runs?page=4&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 5,
                    visuallyHiddenText: 'Page 5',
                    href: '/system/bill-runs?page=5&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  { ellipsis: true },
                  {
                    number: 8,
                    visuallyHiddenText: 'Page 8',
                    href: '/system/bill-runs?page=8&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  }
                ],
                next: {
                  href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                }
              }
            })
          })
        })

        describe('and page 4 is selected', () => {
          beforeEach(() => {
            selectedPage = 4
          })

          it('returns <- Previous 1 2 3 [4] 5 .. 8 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path, queryArgs)

            expect(result).equal({
              numberOfPages: 8,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  {
                    number: 2,
                    visuallyHiddenText: 'Page 2',
                    href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 3,
                    visuallyHiddenText: 'Page 3',
                    href: '/system/bill-runs?page=3&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 4,
                    visuallyHiddenText: 'Page 4',
                    href: '/system/bill-runs?page=4&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: true
                  },
                  {
                    number: 5,
                    visuallyHiddenText: 'Page 5',
                    href: '/system/bill-runs?page=5&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  { ellipsis: true },
                  {
                    number: 8,
                    visuallyHiddenText: 'Page 8',
                    href: '/system/bill-runs?page=8&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  }
                ],
                next: {
                  href: '/system/bill-runs?page=5&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                },
                previous: {
                  href: '/system/bill-runs?page=3&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                }
              }
            })
          })
        })

        describe('and page 5 is selected', () => {
          beforeEach(() => {
            selectedPage = 5
          })

          it('returns <- Previous 1 .. 4 [5] 6 7 8 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path, queryArgs)

            expect(result).equal({
              numberOfPages: 8,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  { ellipsis: true },
                  {
                    number: 4,
                    visuallyHiddenText: 'Page 4',
                    href: '/system/bill-runs?page=4&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 5,
                    visuallyHiddenText: 'Page 5',
                    href: '/system/bill-runs?page=5&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: true
                  },
                  {
                    number: 6,
                    visuallyHiddenText: 'Page 6',
                    href: '/system/bill-runs?page=6&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 7,
                    visuallyHiddenText: 'Page 7',
                    href: '/system/bill-runs?page=7&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 8,
                    visuallyHiddenText: 'Page 8',
                    href: '/system/bill-runs?page=8&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  }
                ],
                next: {
                  href: '/system/bill-runs?page=6&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                },
                previous: {
                  href: '/system/bill-runs?page=4&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 8
          })

          it('returns <- Previous 1 .. 4 5 6 7 [8]', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path, queryArgs)

            expect(result).equal({
              numberOfPages: 8,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  { ellipsis: true },
                  {
                    number: 4,
                    visuallyHiddenText: 'Page 4',
                    href: '/system/bill-runs?page=4&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 5,
                    visuallyHiddenText: 'Page 5',
                    href: '/system/bill-runs?page=5&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 6,
                    visuallyHiddenText: 'Page 6',
                    href: '/system/bill-runs?page=6&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 7,
                    visuallyHiddenText: 'Page 7',
                    href: '/system/bill-runs?page=7&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 8,
                    visuallyHiddenText: 'Page 8',
                    href: '/system/bill-runs?page=8&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: true
                  }
                ],
                previous: {
                  href: '/system/bill-runs?page=7&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                }
              }
            })
          })
        })
      })

      describe('for 9 pages', () => {
        beforeEach(() => {
          numberOfRecords = 425
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          it('returns [1] 2 3 4 5 .. 9 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path, queryArgs)

            expect(result).equal({
              numberOfPages: 9,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: true },
                  {
                    number: 2,
                    visuallyHiddenText: 'Page 2',
                    href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 3,
                    visuallyHiddenText: 'Page 3',
                    href: '/system/bill-runs?page=3&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 4,
                    visuallyHiddenText: 'Page 4',
                    href: '/system/bill-runs?page=4&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 5,
                    visuallyHiddenText: 'Page 5',
                    href: '/system/bill-runs?page=5&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  { ellipsis: true },
                  {
                    number: 9,
                    visuallyHiddenText: 'Page 9',
                    href: '/system/bill-runs?page=9&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  }
                ],
                next: {
                  href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                }
              }
            })
          })
        })

        describe('and page 4 is selected', () => {
          beforeEach(() => {
            selectedPage = 4
          })

          it('returns <- Previous 1 2 3 [4] 5 .. 9 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path, queryArgs)

            expect(result).equal({
              numberOfPages: 9,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  {
                    number: 2,
                    visuallyHiddenText: 'Page 2',
                    href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 3,
                    visuallyHiddenText: 'Page 3',
                    href: '/system/bill-runs?page=3&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 4,
                    visuallyHiddenText: 'Page 4',
                    href: '/system/bill-runs?page=4&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: true
                  },
                  {
                    number: 5,
                    visuallyHiddenText: 'Page 5',
                    href: '/system/bill-runs?page=5&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  { ellipsis: true },
                  {
                    number: 9,
                    visuallyHiddenText: 'Page 9',
                    href: '/system/bill-runs?page=9&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  }
                ],
                next: {
                  href: '/system/bill-runs?page=5&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                },
                previous: {
                  href: '/system/bill-runs?page=3&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                }
              }
            })
          })
        })

        describe('and page 5 is selected', () => {
          beforeEach(() => {
            selectedPage = 5
          })

          it('returns <- Previous 1 .. 4 [5] 6 .. 9 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path, queryArgs)

            expect(result).equal({
              numberOfPages: 9,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  { ellipsis: true },
                  {
                    number: 4,
                    visuallyHiddenText: 'Page 4',
                    href: '/system/bill-runs?page=4&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 5,
                    visuallyHiddenText: 'Page 5',
                    href: '/system/bill-runs?page=5&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: true
                  },
                  {
                    number: 6,
                    visuallyHiddenText: 'Page 6',
                    href: '/system/bill-runs?page=6&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  { ellipsis: true },
                  {
                    number: 9,
                    visuallyHiddenText: 'Page 9',
                    href: '/system/bill-runs?page=9&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  }
                ],
                next: {
                  href: '/system/bill-runs?page=6&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                },
                previous: {
                  href: '/system/bill-runs?page=4&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                }
              }
            })
          })
        })

        describe('and page 6 is selected', () => {
          beforeEach(() => {
            selectedPage = 6
          })

          it('returns <- Previous 1 .. 5 [6] 7 8 9 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path, queryArgs)

            expect(result).equal({
              numberOfPages: 9,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  { ellipsis: true },
                  {
                    number: 5,
                    visuallyHiddenText: 'Page 5',
                    href: '/system/bill-runs?page=5&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 6,
                    visuallyHiddenText: 'Page 6',
                    href: '/system/bill-runs?page=6&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: true
                  },
                  {
                    number: 7,
                    visuallyHiddenText: 'Page 7',
                    href: '/system/bill-runs?page=7&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 8,
                    visuallyHiddenText: 'Page 8',
                    href: '/system/bill-runs?page=8&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 9,
                    visuallyHiddenText: 'Page 9',
                    href: '/system/bill-runs?page=9&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  }
                ],
                next: {
                  href: '/system/bill-runs?page=7&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                },
                previous: {
                  href: '/system/bill-runs?page=5&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 9
          })

          it('returns <- Previous 1 .. 5 6 7 8 [9]', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path, queryArgs)

            expect(result).equal({
              numberOfPages: 9,
              component: {
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs', current: false },
                  { ellipsis: true },
                  {
                    number: 5,
                    visuallyHiddenText: 'Page 5',
                    href: '/system/bill-runs?page=5&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 6,
                    visuallyHiddenText: 'Page 6',
                    href: '/system/bill-runs?page=6&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 7,
                    visuallyHiddenText: 'Page 7',
                    href: '/system/bill-runs?page=7&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 8,
                    visuallyHiddenText: 'Page 8',
                    href: '/system/bill-runs?page=8&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 9,
                    visuallyHiddenText: 'Page 9',
                    href: '/system/bill-runs?page=9&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: true
                  }
                ],
                previous: {
                  href: '/system/bill-runs?page=8&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                }
              }
            })
          })
        })
      })

      describe('for 100 pages', () => {
        beforeEach(() => {
          numberOfRecords = 4975
        })

        describe('and the first page is selected', () => {
          beforeEach(() => {
            selectedPage = 1
          })

          it('returns [1] 2 3 4 5 .. 100 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path, queryArgs)

            expect(result).equal({
              numberOfPages: 100,
              component: {
                items: [
                  {
                    number: 1,
                    visuallyHiddenText: 'Page 1',
                    href: '/system/bill-runs',
                    current: true
                  },
                  {
                    number: 2,
                    visuallyHiddenText: 'Page 2',
                    href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 3,
                    visuallyHiddenText: 'Page 3',
                    href: '/system/bill-runs?page=3&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 4,
                    visuallyHiddenText: 'Page 4',
                    href: '/system/bill-runs?page=4&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 5,
                    visuallyHiddenText: 'Page 5',
                    href: '/system/bill-runs?page=5&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  { ellipsis: true },
                  {
                    number: 100,
                    visuallyHiddenText: 'Page 100',
                    href: '/system/bill-runs?page=100&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  }
                ],
                next: {
                  href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                }
              }
            })
          })
        })

        describe('and page 4 is selected', () => {
          beforeEach(() => {
            selectedPage = 4
          })

          it('returns <- Previous 1 2 3 [4] 5 .. 100 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path, queryArgs)

            expect(result).equal({
              numberOfPages: 100,
              component: {
                items: [
                  {
                    number: 1,
                    visuallyHiddenText: 'Page 1',
                    href: '/system/bill-runs',
                    current: false
                  },
                  {
                    number: 2,
                    visuallyHiddenText: 'Page 2',
                    href: '/system/bill-runs?page=2&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 3,
                    visuallyHiddenText: 'Page 3',
                    href: '/system/bill-runs?page=3&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 4,
                    visuallyHiddenText: 'Page 4',
                    href: '/system/bill-runs?page=4&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: true
                  },
                  {
                    number: 5,
                    visuallyHiddenText: 'Page 5',
                    href: '/system/bill-runs?page=5&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  { ellipsis: true },
                  {
                    number: 100,
                    visuallyHiddenText: 'Page 100',
                    href: '/system/bill-runs?page=100&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  }
                ],
                next: {
                  href: '/system/bill-runs?page=5&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                },
                previous: {
                  href: '/system/bill-runs?page=3&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                }
              }
            })
          })
        })

        describe('and page 49 is selected', () => {
          beforeEach(() => {
            selectedPage = 49
          })

          it('returns <- Previous 1 .. 48 [49] 50 .. 100 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path, queryArgs)

            expect(result).equal({
              numberOfPages: 100,
              component: {
                items: [
                  {
                    number: 1,
                    visuallyHiddenText: 'Page 1',
                    href: '/system/bill-runs',
                    current: false
                  },
                  { ellipsis: true },
                  {
                    number: 48,
                    visuallyHiddenText: 'Page 48',
                    href: '/system/bill-runs?page=48&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 49,
                    visuallyHiddenText: 'Page 49',
                    href: '/system/bill-runs?page=49&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: true
                  },
                  {
                    number: 50,
                    visuallyHiddenText: 'Page 50',
                    href: '/system/bill-runs?page=50&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  { ellipsis: true },
                  {
                    number: 100,
                    visuallyHiddenText: 'Page 100',
                    href: '/system/bill-runs?page=100&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  }
                ],
                next: {
                  href: '/system/bill-runs?page=50&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                },
                previous: {
                  href: '/system/bill-runs?page=48&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                }
              }
            })
          })
        })

        describe('and page 97 is selected', () => {
          beforeEach(() => {
            selectedPage = 97
          })

          it('returns <- Previous 1 .. 96 [97] 98 99 100 Next ->', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path, queryArgs)

            expect(result).equal({
              numberOfPages: 100,
              component: {
                items: [
                  {
                    number: 1,
                    visuallyHiddenText: 'Page 1',
                    href: '/system/bill-runs',
                    current: false
                  },
                  { ellipsis: true },
                  {
                    number: 96,
                    visuallyHiddenText: 'Page 96',
                    href: '/system/bill-runs?page=96&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 97,
                    visuallyHiddenText: 'Page 97',
                    href: '/system/bill-runs?page=97&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: true
                  },
                  {
                    number: 98,
                    visuallyHiddenText: 'Page 98',
                    href: '/system/bill-runs?page=98&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 99,
                    visuallyHiddenText: 'Page 99',
                    href: '/system/bill-runs?page=99&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 100,
                    visuallyHiddenText: 'Page 100',
                    href: '/system/bill-runs?page=100&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  }
                ],
                next: {
                  href: '/system/bill-runs?page=98&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                },
                previous: {
                  href: '/system/bill-runs?page=96&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                }
              }
            })
          })
        })

        describe('and the last page is selected', () => {
          beforeEach(() => {
            selectedPage = 100
          })

          it('returns <- Previous 1 .. 96 97 98 99 [100]', () => {
            const result = PaginatorPresenter.go(numberOfRecords, selectedPage, path, queryArgs)

            expect(result).equal({
              numberOfPages: 100,
              component: {
                items: [
                  {
                    number: 1,
                    visuallyHiddenText: 'Page 1',
                    href: '/system/bill-runs',
                    current: false
                  },
                  { ellipsis: true },
                  {
                    number: 96,
                    visuallyHiddenText: 'Page 96',
                    href: '/system/bill-runs?page=96&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 97,
                    visuallyHiddenText: 'Page 97',
                    href: '/system/bill-runs?page=97&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 98,
                    visuallyHiddenText: 'Page 98',
                    href: '/system/bill-runs?page=98&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 99,
                    visuallyHiddenText: 'Page 99',
                    href: '/system/bill-runs?page=99&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: false
                  },
                  {
                    number: 100,
                    visuallyHiddenText: 'Page 100',
                    href: '/system/bill-runs?page=100&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b',
                    current: true
                  }
                ],
                previous: {
                  href: '/system/bill-runs?page=99&billing-account-id=c17c0a2b-6950-490b-8c3a-4dc9f01da368&licence-id=354fc0bd-0820-4611-a6af-874480bbae3b'
                }
              }
            })
          })
        })
      })
    })
  })
})
