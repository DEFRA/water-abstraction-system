# Tear down

This function supports our [water-abstraction-acceptance-tests](https://github.com/DEFRA/water-abstraction-acceptance-tests). At the start of each test, it will make an HTTP call to `POST /data/tear-down` resulting in `TearDownService.go()` being called.

The service and those it calls are responsible for clearing the various schemas we use of test data. Some tables have a `is_test` field that immediately identifies the record as being created for a test.

But each test will create data that won't be flagged this way. So, the tear-down services also remove records we can identify as being test data.

- it might be linked to a `is_test` record
- it has a known value, for example, `name`, that is specific to the acceptance tests

Ideally, we wouldn't need to remove anything between the tests. We could then avoid this step and the delay it causes. But until we re-architect fully the acceptance tests we've inherited we have to work with what we've got.

When we took on WRLS [water-abstraction-service](https://github.com/DEFRA/water-abstraction-service) had a tear-down endpoint. But it would take more than a minute to complete. This caused the tests to take a long time to finish and often caused them to fail.

We built a more performant version. It would typically get the job done in 15 to 20 seconds. But sometimes this would creep to 40 seconds which again would cause test runs to fail.

We are adding this README at the point we've taken a second shot at an even more performant option. We wanted to capture what we tried and the results we got to help

- explain why this is the current solution
- avoid anyone wasting time trying anything we've already tried
- spark inspiration of an _even better_ way of doing this!

## Strategies tried and selected

Including sticking with what we had, we tried 8 separate ways of clearing down the test data. We would run the supplementary billing `journey.cy.js` acceptance test and record the time it took in milliseconds to

- wipe each of the schemas
- complete all schemas

We did this a number of times and then averaged out the results. We initially selected the one that was most performant overall ([Promise all](#promise-all)) but then reverted to the second best option of [Single query](#single-query).

This was because we realised that in some cases, especially when dealing with the `water` schema, tables have be cleared in a specific order. For example, to determine which billing transactions to delete you have to be able to link from them to the 'test' region via billing invoice licences, billing invoices, and billing batches.

Just throwing all delete statements into a [Promise.all()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) meant we lost control of this leading to sporadic errors.

> This was tested on an Apple M1 Mac. The DB was a complete import of the NALD data including all returns. This explains why the times recorded here (especially for the 'No changes' strategy) might be greater than you see if doing the same thing yourself.

### No change

As a bench mark we recorded what the times were using the existing solution. The key issue was clearing the `WATER` schema, which we suspected was due to the numerous foreign key constraints the previous team added.

When a record is deleted these constraints are triggered and checked.

### Disable the triggers

In this attempt the only change we made was to disable all the triggers in a schema first, then leave the existing code run, followed by re-enabling the triggers.

This was the critical change that got the average completion time down from 42 secs to less than 7 secs.

### Single query

> Our selected strategy

The existing functionality would clear down all schemas at the same time using a [Promise.all()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all). But within each schema's tear-down service the tables would be cleared down one at a time using [Knex.js](https://knexjs.org/).

We wanted to test if performance was better if we fired a single [raw query](https://knexjs.org/guide/raw.html#raw-queries) at the DB for each schema instead. We retained the trigger disabling strategy because of the impact it had. We simply combined the calls for these with the delete table calls into a single DB query.

This time we got a small 1 sec improvement in the average time to complete.

### Promise all

Next we wanted to test what would happen if instead of firing a [single query per schema](#single-query), we adopted the same `Promise.all()` pattern used at the schema level to the queries inside each schema service.

We rebuilt all the existing delete functions to just use 'raw' queries. This allowed us to bring the disabling of a table's triggers together with it's delete statement as one request to the DB.

We then fired them all at the same time using `Promise.all()`, whilst clearing down all schemas at the same time.

We were concerned that we might be pushing _too much_ at the DB at the same time. But we did see a minor improvement in the average completion time of 100ms. Though it should be noted that the average schema completion time degraded for some schemas.

But even though this was the most performant, we opted instead for [Single query](#single-query) because of the need to control the order of the deletions.

### Best of

Having seen that some schemas performed better when fired as a [single query](#single-query) whereas others got their best times using the [promise all strategy](#promise-all) we tried a 'best of'.

With this we saw a degradation in completion time of 2 secs. We were also uncomfortable with mixing patterns in the schemas so were happy to see this didn't win out!

### All in one

Finally, we tried lumping all the queries we were firing into a single query. Essentially, let the DB do it all and perhaps optimise it better than what we were attempting.

Again, this confirmed disabling the table triggers still had a massive impact on average completion time as it was vastly quicker than our current implementation. But it was still 2 secs off [Promise all](#promise-all).

## Results

> The average times are in milliseconds. Just divide by 1000 for secs, for example, 1770 / 1000 = 1.7 secs

| Schema  | No change | Just triggers | Single Query | Promise all | Best of | All in one |
| ------- | --------- | ------------- | ------------ | ----------- | ------- | ---------- |
| CRM     | 1770      | 2106          | **1185**     | 964         | 1444    | N/A        |
| IDM     | 58        | 73            | **46**       | 852         | 1199    | N/A        |
| PERMIT  | 165       | 266           | **156**      | 893         | 1282    | N/A        |
| RETURNS | 7176      | 6121          | **3517**     | 4474        | 7528    | N/A        |
| WATER   | 42268     | 4413          | **5266**     | 5106        | 5289    | N/A        |
| -       | -         | -             | -            | -           | -       |            |
| Total   | 42269     | 6556          | **5266**     | 5106        | 7529    | 7457       |
