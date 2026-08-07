create or replace function public.get_country_circuits(p_country_slug text)
returns jsonb
language sql
security definer
set search_path = public
as $$
with normalized_country as (
  select lower(trim(coalesce(p_country_slug, ''))) as country_slug
),
country_row as (
  select
    c.id,
    c.name
  from countries c
  join normalized_country country_input
    on lower(trim(c.name)) = country_input.country_slug
  limit 1
),
language_row as (
  select l.id
  from languages l
  where l.iso_code = 'fr'
  limit 1
),
circuit_rows as (
  select
    c.id,
    c.slug,
    coalesce(cc.title, '') as title,
    coalesce(cc.subtitle, '') as subtitle,
    coalesce(cc.estimated_duration, '') as estimated_duration,
    hero_image.image_url as hero_image_url,
    hero_image.alt_text as hero_image_alt_text,
    hero_image.display_mode as hero_image_display_mode,
    hero_image.focal_position as hero_image_focal_position,
    country_input.country_slug as country_slug,
    country.name as country_name,
    count(cd.destination_id)::int as destination_count
  from circuits c
  cross join normalized_country country_input
  join country_row country
    on country.id = c.country_id
  left join circuit_contents cc
    on cc.circuit_id = c.id
   and cc.language_id = (select id from language_row)
  left join circuit_destinations cd
    on cd.circuit_id = c.id
  left join lateral (
    select
      ci.image_url,
      ci.alt_text,
      ci.display_mode,
      ci.focal_position
    from circuit_images ci
    where ci.circuit_id = c.id
      and ci.image_type = 'hero'
      and ci.is_active = true
    order by ci.position asc nulls last
    limit 1
  ) as hero_image
    on true
  group by
    c.id,
    c.slug,
    cc.title,
    cc.subtitle,
    cc.estimated_duration,
    hero_image.image_url,
    hero_image.alt_text,
    hero_image.display_mode,
    hero_image.focal_position,
    country_input.country_slug,
    country.name
)
select coalesce(
  jsonb_agg(
    jsonb_build_object(
      'id', id,
      'slug', slug,
      'title', title,
      'subtitle', subtitle,
      'estimated_duration', estimated_duration,
      'heroImage',
        case
          when hero_image_url is null then null
          else jsonb_build_object(
            'imageUrl', hero_image_url,
            'altText', coalesce(hero_image_alt_text, ''),
            'displayMode', coalesce(hero_image_display_mode, ''),
            'focalPosition', coalesce(hero_image_focal_position, '')
          )
        end,
      'country_slug', country_slug,
      'country_name', country_name,
      'destination_count', destination_count
    )
    order by title, slug
  ),
  '[]'::jsonb
)
from circuit_rows;
$$;
