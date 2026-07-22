# Supabase city schema required

This document lists the real schema information that must be confirmed in Supabase before connecting `getCity()` to live data from `cities`, `countries`, and `administrative_areas`.

## Tables to confirm

### `countries`
- Exact primary key column name
- Exact country name column name
- Optional ISO code column name, if present

### `administrative_areas`
- Exact primary key column name
- Exact name column name
- Exact foreign key column and constraint pointing to `countries`

### `cities`
- Exact primary key column name
- Exact slug column name
- Exact city name column name
- Exact foreign key column and constraint pointing to `countries`
- Exact foreign key column and constraint pointing to `administrative_areas`
- Whether these business fields already exist, and with what exact names:
  - `population`
  - `latitude`
  - `longitude`
  - `status`

## Read-only schema audit query

Run the following query in the Supabase SQL Editor. It reads metadata only and does not create, update, or delete anything.

```sql
with target_tables as (
  select unnest(array['countries', 'administrative_areas', 'cities']) as table_name
),
columns_info as (
  select
    c.table_schema,
    c.table_name,
    c.ordinal_position,
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default
  from information_schema.columns c
  join target_tables t on t.table_name = c.table_name
  where c.table_schema = 'public'
),
primary_keys as (
  select
    tc.table_schema,
    tc.table_name,
    kcu.column_name,
    tc.constraint_name
  from information_schema.table_constraints tc
  join information_schema.key_column_usage kcu
    on tc.constraint_name = kcu.constraint_name
   and tc.table_schema = kcu.table_schema
   and tc.table_name = kcu.table_name
  join target_tables t on t.table_name = tc.table_name
  where tc.table_schema = 'public'
    and tc.constraint_type = 'PRIMARY KEY'
),
foreign_keys as (
  select
    tc.table_schema,
    tc.table_name,
    kcu.column_name,
    tc.constraint_name,
    ccu.table_name as foreign_table_name,
    ccu.column_name as foreign_column_name
  from information_schema.table_constraints tc
  join information_schema.key_column_usage kcu
    on tc.constraint_name = kcu.constraint_name
   and tc.table_schema = kcu.table_schema
   and tc.table_name = kcu.table_name
  join information_schema.constraint_column_usage ccu
    on tc.constraint_name = ccu.constraint_name
   and tc.table_schema = ccu.table_schema
  join target_tables t on t.table_name = tc.table_name
  where tc.table_schema = 'public'
    and tc.constraint_type = 'FOREIGN KEY'
)
select
  ci.table_schema,
  ci.table_name,
  ci.ordinal_position,
  ci.column_name,
  ci.data_type,
  ci.is_nullable,
  ci.column_default,
  pk.constraint_name as primary_key_constraint,
  case when pk.column_name is not null then true else false end as is_primary_key,
  fk.constraint_name as foreign_key_constraint,
  fk.foreign_table_name,
  fk.foreign_column_name
from columns_info ci
left join primary_keys pk
  on pk.table_schema = ci.table_schema
 and pk.table_name = ci.table_name
 and pk.column_name = ci.column_name
left join foreign_keys fk
  on fk.table_schema = ci.table_schema
 and fk.table_name = ci.table_name
 and fk.column_name = ci.column_name
order by ci.table_name, ci.ordinal_position;
```

## What to bring back from Supabase
- Exact column names for `countries`, `administrative_areas`, and `cities`
- Exact foreign key relationships between these tables
- Confirmation of whether `population`, `latitude`, `longitude`, and `status` already exist in `cities`
- Any schema name other than `public`, if applicable
