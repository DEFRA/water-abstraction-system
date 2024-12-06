'use strict'

/**
 * Handles voiding the return logs for a licence after reissuing new ones
 * @module VoidLicenceReturnLogsService
 */

const { timestampForPostgres } = require('../../lib/general.lib.js')
const ReturnLogModel = require('../../models/return-log.model.js')

/**
 * Handles voiding the return logs for a licence after reissuing new ones
 *
 * The goal with reissuing return logs is to avoid voiding and reissuing a return log unnecessarily. Why? Imagine a
 * return log requires daily submissions, and covers 9 months of input. If we void that return log those values need to
 * be re-keyed against the new return log(s). If the 'change' truly impacts the return log that cannot be helped. But if
 * it doesn't, not only is that a lot of work for a user, it opens the possibility for the values to be re-keyed
 * incorrectly.
 *
 * As an example, imagine we have a licence with two return versions, each containing a single return requirement, both
 * of which are flagged as 'all-year'. Also, that the return cycle/year we are processing is the year where the
 * requirements for return switch from the first to the second return version.
 *
 * In that year there would be two return logs generated, with start and end dates determined by the return cycle and
 * those return versions. The licence is then revoked (the date falls during the period the second return version
 * covers) and that change triggers the `ProcessLicenceReturnLogsService` to reissue the second return log.
 *
 * If we reissued and voided based only on return cycle, both return logs would be voided and need to be re-keyed. What
 * `ProcessLicenceReturnLogsService` and this service is aiming for is that only the second return log gets reissued.
 *
 * So, it expects `ProcessLicenceReturnLogsService` to pass it the return log ID's it generated from the return
 * requirements it processed. It then sets the status to `void` for all return logs that
 *
 * - are for the licence that changed
 * - are for the return cycle being processed
 * - that have an end date on or after the change date
 * - that do not have a return ID that matches one in `reissuedReturnLogIds`
 *
 * ## Scenarios
 *
 * ### Licence gets an expiry date
 *
 * This replicates the example provided above. A licence with two existing return logs that span the all-year cycle
 * is revoked on 2022-12-31. The first return log is left unchanged, as is the reissue. But second is voided.
 *
 * |Return log ID                           |Lic ref|Start date|End date  |Ref. |Return cycle ID   |Before  |After   |
 * |----------------------------------------|-------|----------|----------|-----|------------------|--------|--------|
 * |v1:9:01/1234:12345:2022-04-01:2022-09-30|01/1234|2022-04-01|2022-09-30|12345|813c6c4a-2b8b-49bb|complete|complete|
 * |v1:9:01/1234:12346:2022-10-01:2023-03-31|01/1234|2022-10-01|2023-03-31|12346|813c6c4a-2b8b-49bb|complete|void    |
 * |v1:9:01/1234:12346:2022-10-01:2022-12-31|01/1234|2022-10-01|2022-12-31|12346|813c6c4a-2b8b-49bb|due     |due     |
 *
 * ### Return version superseded
 *
 * A licence has one return version (containing one return requirement) so one existing return log for the return cycle.
 * That return version is superseded (the purpose was incorrect). The "change date" is taken from the start of the new
 * return version but in this case it remains the same as the existing one.
 *
 * |Return log ID                           |Lic ref|Start date|End date  |Ref. |Return cycle ID   |Before  |After   |
 * |----------------------------------------|-------|----------|----------|-----|------------------|--------|--------|
 * |v1:9:02/1234:17890:2022-04-01:2023-03-31|02/1234|2022-04-01|2023-03-31|17890|813c6c4a-2b8b-49bb|complete|void    |
 * |v1:9:02/1234:29876:2022-04-01:2023-03-31|02/1234|2022-04-01|2023-03-31|29876|813c6c4a-2b8b-49bb|due     |due     |
 *
 * ### Return version added
 *
 * A licence has one return version (containing one return requirement) so one existing return log for the return cycle.
 * A new return version is added, which means it will have a different start date. The "change date" is that new start
 * date.
 *
 * |Return log ID                           |Lic ref|Start date|End date  |Ref. |Return cycle ID   |Before  |After   |
 * |----------------------------------------|-------|----------|----------|-----|------------------|--------|--------|
 * |v1:9:03/1234:10023:2022-04-01:2023-03-31|03/1234|2022-04-01|2023-03-31|10023|813c6c4a-2b8b-49bb|complete|void    |
 * |v1:9:03/1234:10023:2022-04-01:2022-08-31|03/1234|2022-04-01|2022-08-31|10023|813c6c4a-2b8b-49bb|due     |due     |
 * |v1:9:03/1234:30014:2022-09-01:2023-03-31|03/1234|2022-09-01|2023-03-31|30014|813c6c4a-2b8b-49bb|due     |due     |
 *
 * @param {string[]} reissuedReturnLogIds - The IDs from the return logs generated for the return cycle being processed
 * @param {licenceRef} licenceRef - The licence reference for the 'changed' licence
 * @param {string} returnCycleId - The ID of the return cycle being processed
 * @param {Date} changeDate - The date from which the 'change' applies
 */
async function go(reissuedReturnLogIds, licenceRef, returnCycleId, changeDate) {
  await ReturnLogModel.query()
    .patch({ status: 'void', updatedAt: timestampForPostgres() })
    .where('returnCycleId', returnCycleId)
    .where('licenceRef', licenceRef)
    .where('endDate', '>=', changeDate)
    .whereNotIn('id', reissuedReturnLogIds)
}

module.exports = {
  go
}
