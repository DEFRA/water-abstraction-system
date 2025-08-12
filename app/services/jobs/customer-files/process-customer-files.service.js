'use strict'

/**
 * Updates the last customer file reference and created_at fields for billing accounts whose addresses have been updated
 * @module ProcessCustomerFilesService
 */

const BillingAccount = require('../../../models/billing-account.model.js')
const ExpandedError = require('../../../errors/expanded.error.js')
const ViewCustomerFilesRequest = require('../../../requests/charging-module/view-customer-files.request.js')
const {
  calculateAndLogTimeTaken,
  currentTimeInNanoseconds,
  timestampForPostgres
} = require('../../../lib/general.lib.js')

/**
 * Updates the last customer file reference and created_at fields for billing accounts whose addresses have been updated
 *
 * This replaces a legacy job in the
 * {@link https://github.com/DEFRA/water-abstraction-service | water-abstraction-service}.
 *
 * When a billing account's address is updated in WRLS, the details are sent to the
 * {@link https://github.com/DEFRA/sroc-charging-module-api | Charging Module API}. Then, either when a bill run is
 * 'sent' or during a weekly mob-up job, the **Charging Module** will generate a 'customer file' which is then sent to
 * SOP. SOP uses the file to update its customer records with the new address.
 *
 * Users of WRLS want to see confirmation the update has reached SOP. For example, this helps them decide when to
 * generate a bill run.
 *
 * The **Charging Module** provides an endpoint that when requested will provide details on the customer files
 * generated for the last 'x' days, including which accounts were included in them.
 *
 * This job uses that information to update those changed billing accounts with the customer file reference and date
 * of creation. This is then displayed in the UI so WRLS users can confirm the change has been sent to SOP.
 *
 * We only store details for the _last_ customer file. So, if a billing account has been updated multiple times we only
 * care about the latest.
 *
 * @param {number} days - The number of days to look back for customer files
 */
async function go(days) {
  try {
    const startTime = currentTimeInNanoseconds()

    const customerFiles = await _fetchCustomerFiles(days)

    const billingAccounts = _billingAccounts(customerFiles)

    for (const billingAccount of billingAccounts) {
      await _updateBillingAccount(billingAccount)
    }

    calculateAndLogTimeTaken(startTime, 'Customer files job complete', { count: billingAccounts.length })
  } catch (error) {
    global.GlobalNotifier.omfg('Customer files job failed', null, error)
  }
}

/**
 * An account number might appear in the response returned from the Charging Module multiple times. For example, the
 * address for **CB01BEEB** is updated in WRLS on 2025/08/04 and this change is exported to SOP by the Charging Module
 * in `nalac50001.dat` on the weekend 2025/08/09.
 *
 * A mistake is then spotted so the address is updated again on 2025/08/10. A supplementary bill run that includes the
 * billing account is then created and 'sent' on 2025/08/11. This will force the Charging Module to generate another
 * customer file; `nalac50002.dat` on the same day.
 *
 * When the job is run that day and is configured to look at 14 days history, then both `nalac50001.dat` and
 * `nalac50002.dat` will be in `customerFiles`, and **CB01BEEB** will be in both.
 *
 * When it comes to updating WRLS, we only want to hold the details for the latest exported customer file against
 * **CB01BEEB**.
 *
 * This function converts the response we get from the Charging Module into an array that contains a single entry for
 * each billing account found. Against each entry is the latest customer file reference and date it was exported.
 *
 * We don't do anything clever with checking if an entry already exists, or if the `latestDate` against the entry is
 * less than the entry being processed. This is because we know the Charging Module API returns the customer files in
 * ascending date order i.e. the oldest customer file is first, and the newest (latest) is last.
 *
 * @private
 */
function _billingAccounts(customerFiles) {
  const billingAccounts = {}

  for (const customerFile of customerFiles) {
    const { exportedAt, exportedCustomers: accountNumbers, fileReference } = customerFile
    const exportedAtDate = new Date(exportedAt)

    for (const accountNumber of accountNumbers) {
      billingAccounts[accountNumber] = {
        accountNumber,
        lastTransactionFile: fileReference,
        lastTransactionFileCreatedAt: exportedAtDate
      }
    }
  }

  return Object.values(billingAccounts)
}

async function _fetchCustomerFiles(days) {
  const result = await ViewCustomerFilesRequest.send(days)

  if (!result.succeeded) {
    throw new ExpandedError('Charging Module view customer files request failed', { days })
  }

  return result.response.body
}

async function _updateBillingAccount(billingAccount) {
  const { accountNumber, lastTransactionFile, lastTransactionFileCreatedAt } = billingAccount

  // We want to set the updatedAt value if we touch the record. But because we could be processing the same customer
  // file details repeatedly, for example, `days` is configured to 14, we only want to update the billing account record
  // the first time we process the entry.
  await BillingAccount.query()
    .patch({ lastTransactionFile, lastTransactionFileCreatedAt, updatedAt: timestampForPostgres() })
    .where('accountNumber', accountNumber)
    .where((builder) => {
      builder.where('last_transaction_file', '<>', lastTransactionFile).orWhereNull('last_transaction_file')
    })
}

module.exports = {
  go
}
