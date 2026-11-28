-----------------------------------------------------------------------------
-- Filename:  V8__groups_name_ci_unique.sql
-----------------------------------------------------------------------------


-----------------------------------------------------------------------------
-- Enforce case-insensitive uniqueness for group names.
-- Group names are looked up with lower(name), so "Foo" and "foo" must not both
-- be able to exist.
--
-- NOTE: This will fail if the existing data already contains names that differ
-- only by case. Resolve those rows before running this migration.
-- If this migration fails, resolve the colliding rows, then run "mvn flyway:repair"
-- before retrying.
-----------------------------------------------------------------------------
create unique index uq_groups_name_lower on groups (lower(name));
