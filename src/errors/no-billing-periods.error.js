/**
 * Error thrown when no billing periods can be determined for a bill run
 *
 * @module NoBillingPeriodsError
 */

export default class NoBillingPeriodsError extends Error {
  constructor(year = null) {
    super(
      "No billing periods could be determined. Perhaps you are trying to create a supplementary in an environment where the last annual doesn't exist or was in a PRESROC year."
    )

    this.year = year
  }
}
