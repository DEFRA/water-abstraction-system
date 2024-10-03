// 'use strict'

// /**
//  * Transforms NALD licence data to determine eligibility for supplementary billing.
//  * @module TransformLicenceSupplementaryFlagsService
//  */

// const FetchLicenceChargeVersionsService = require('./fetch-licence-charge-versions.service.js')
// const FlagForSupplementaryBillingService = require('./flag-for-supplementary-billing.service.js')

// const MARCH = 2
// const MONTH_END = 31
// /**
//  * Transforms NALD licence data to determine eligibility for supplementary billing.
//  *
//  * When importing a licence from NALD with an end date, this service checks if the licence should be included in
//  * supplementary billing.
//  * It orchestrates these checks and applies the necessary flags when required.
//  * @param {object} transformedLicence - An object representing a valid WRLS licence
//  * @param {string} wrlsLicenceId - The WRLS licence ID
//  */
// async function go (transformedLicence, wrlsLicenceId) {
//   const naldEndDates = {
//     revokedDate: transformedLicence.revokedDate,
//     expiredDate: transformedLicence.expiredDate,
//     lapsedDate: transformedLicence.lapsedDate
//   }

//   // filter out any null end dates
//   naldEndDates.filter((endDate) => {
//     return endDate !== null
//   })

//   const dateIsFuture = _futureEndDate(naldEndDates)
//   const dateIsSixYearsAgo = _endDateOlderThanSixYears(naldEndDates)
//   // Is the date within our range 6 years ago to current financial year end

//   if (transformedLicence.expiredDate === null &&
//     transformedLicence.lapsedDate === null &&
//     transformedLicence.revokedDate === null &&
//     dateIsFuture &&
//     dateIsSixYearsAgo) {
//     return
//   }

//   const wrlsLicence = await FetchLicenceChargeVersionsService.go(wrlsLicenceId)
//   await FlagForSupplementaryBillingService.go(transformedLicence, wrlsLicence)
// }

// function _futureEndDate (naldEndDates) {
//   const financialYearEnd = _getFinancialYearEnd()

//   const futureEndDate = naldEndDates.some((endDate) => {
//     const endDateYear = endDate.getFullYear()
//     const endDateMonth = endDate.getMonth()
//     const endDateDay = endDate.getDay()

//     // 2025-03-01
//     if (endDateYear >= financialYearEnd.getFullYear() &&
//         endDateMonth >= financialYearEnd.getMonth() &&
//         endDateDay > financialYearEnd.getDay()) {

//         }
//   })
// }

// function _getFinancialYear (date) {
//   let year = date.getFullYear()

//   if (date.getMonth() >= APRIL) {
//     year++
//   }

//   return year
// }


// function _getFinancialYearEnd () {
//   const financialYearEnd = _getFinancialYear(new Date())

//   // 2025-03-31
//   return new Date(financialYearEnd, MARCH, MONTH_END)
// }

// function _endDateOlderThanSixYears (naldEndDates) {
//   const dateIsOlderThanSixYears = naldEndDates.some((endDate) => {
//     const endDateYear = endDate.getFullYear()
//     const endDateMonth = endDate.getMonth()
//     const endDateDate = endDate.getDay()

//     if (endDateYear <)
//   })

//   return dateIsOlderThanSixYears
// }

// module.exports = {
//   go
// }
