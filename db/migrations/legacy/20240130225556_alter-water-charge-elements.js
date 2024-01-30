'use strict'

// NOTE: The downside of creating views over the tables is we now cannot alter them easily. If you attempt to alter a
// table that has a dependent view you'll get this message; 'cannot alter type of a column used by a view or rule'.
//
// There is no way round it other than to drop the view. We don't want to have to duplicate whatever is required to
// create the view in this legacy migration so have had to find an alternate approach.
//
// We found a solution that relies on a PG function that will return a view's definition. So, we can grab a copy of
// the affected view's create definition, drop the view, make our changes, then recreate the view.
//
// This solution avoids the risk of us putting back the view differently to what it actually was.
//
// Credit to https://stackoverflow.com/a/62793792/6117745

exports.up = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .raw(`
    DO $$
      DECLARE v_charge_references_def text;
      DECLARE exec_text text;
    BEGIN
      v_charge_references_def := pg_get_viewdef('public.charge_references');
      DROP VIEW public.charge_references;

      -- do your other stuff
      TRUNCATE water.charge_elements;
      ALTER Table water.charge_elements ALTER COLUMN volume TYPE NUMERIC;

      exec_text := format('CREATE VIEW public.charge_references AS %s',
          v_charge_references_def);
      EXECUTE exec_text;
    END $$;
    `)
}

exports.down = function (knex) {
  return knex
    .schema
    .withSchema('water')
    .raw(`
    DO $$
      DECLARE v_charge_references_def text;
      DECLARE exec_text text;
    BEGIN
      v_charge_references_def := pg_get_viewdef('public.charge_references');
      DROP VIEW public.charge_references;

      -- do your other stuff
      TRUNCATE water.charge_elements;
      ALTER Table water.charge_elements ALTER COLUMN volume TYPE NUMERIC(8,2);

      exec_text := format('CREATE VIEW public.charge_references AS %s',
          v_charge_references_def);
      EXECUTE exec_text;
    END $$;
    `)
}
