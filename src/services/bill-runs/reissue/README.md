# Reissue

> Sometimes folks will talk about rebilling. Technically there is a difference but from a system point of view they are the same thing.

## Context

WRLS supports going back and changing the charging information for customers up to 6 years back from the current date. When this happens we have to recalculate bills, working out what debits and credits cancel each other out and what remains to be owed or credited.

Sometimes the change is purely a billing contact. For example, an invoice is unpaid but it turns out it is because the previous contact has moved on and the invoices need to go to a different contact and address. For accounting reasons we can't just send a new invoice and cancel the previous one. A credit has to be raised to the previous billing account and then a new invoice sent.

For these specific cases it was requested that a rebilling feature (later to be called reissue) was implemented. This would allow a user to flag a bill in the service for reissue. Then, when a supplementary bill run was created the engine would first process these flagged bills. For each one a request is sent to the [Charging Module API to rebill the bill](https://defra.github.io/sroc-charging-module-api-docs/#/bill-run/RebillBillRunInvoice).

The CHA would then automatically generate a new credit and debit bill. On our side along with setting flags and other info on the source bill, we import the data for the new bills into WRLS and include them in the bill run.

When we first implemented the SROC supplementary billing engine this was seen as 'must have' feature.

## Issues

On the face of it it seems simple enough. But it complicates what is already a very complex process. Plus, it leads to a proliferation of logic throughout the service about whether a bill is the source of a reissue, or one of the results and if so to amend the data displayed. There are estimated to more than a thousand lines of code, not including unit tests, throughout the legacy code base supporting this one feature.

All this to support, after we checked, 8 instances of reissuing a bill. Added to that, those were done early in the feature being shipped. No bill has been reissued for a number of years now.

In fact, the whole feature was placed behind a feature flag to allow us to ship the rest of supplementary billing. We could then focus on the testing of reissuing bills later. Supplementary billing was being used in `production` from September 2023. In that time we've never enabled the flag nor completed the testing.

Because of this as we have migrated other legacy views and functionality we have disregarded anything related to reissuing.

## Current state

The alternative to using the service is simply to call SSCL and request they reissue a bill. We've held off enabling the feature pending the business making a firm decision that this will be the process they follow in future.

During a refactor of the supplementary billing engine to incorporate improvements we learnt building the annual billing engine we decided to silo off the reissue logic. Doing so brings the supplementary process even more inline with annual which should help maintaining them in future.

We're not quite brave enough to delete the services we built but we're 99% certain that one day we'll be given the green light to do so. Till then they can live here.
