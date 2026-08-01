create or replace function public.get_circuit(
  p_slug text,
  p_language_iso text default 'fr'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slug text;
  v_language_iso text;
  v_language_id uuid;
  v_circuit record;
  v_content record;
  v_destinations jsonb;
begin
  v_slug := lower(trim(coalesce(p_slug, '')));
  v_language_iso := lower(trim(coalesce(p_language_iso, 'fr')));

  if v_slug = '' then
    return null;
  end if;

  select c.id, c.slug, c.country_id
  into v_circuit
  from circuits c
  where c.slug = v_slug
  limit 1;

  if v_circuit.id is null then
    return null;
  end if;

  select l.id
  into v_language_id
  from languages l
  where l.iso_code = v_language_iso
  limit 1;

  if v_language_id is null then
    return null;
  end if;

  select
    cc.title,
    cc.subtitle,
    cc.short_description,
    cc.introduction,
    cc.estimated_duration,
    cc.seo_title,
    cc.seo_description
  into v_content
  from circuit_contents cc
  where cc.circuit_id = v_circuit.id
    and cc.language_id = v_language_id
  limit 1;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', d.id,
        'slug', d.slug,
        'position', cd.position,
        'type', case
          when d.city_id is not null then 'city'
          when d.poi_id is not null then 'poi'
          when d.administrative_area_id is not null then 'administrative_area'
          when d.country_id is not null then 'country'
          else 'unknown'
        end,
        'title', coalesce(dc.title, c.name, p.name, aa.name, co.name, 'Destination'),
        'subtitle', dc.subtitle,
        'shortDescription', dc.short_description,
        'latitude', c.latitude,
        'longitude', c.longitude,
        'imageUrl', case
          when d.city_id is not null then ci.image_url
          when d.poi_id is not null then pi.image_url
          else null
        end
      )
      order by cd.position
    ),
    '[]'::jsonb
  )
  into v_destinations
  from circuit_destinations cd
  join destinations d on d.id = cd.destination_id
  left join destination_contents dc
    on dc.destination_id = d.id
   and dc.language_id = v_language_id
  left join cities c
    on c.id = d.city_id
  left join poi p
    on p.id = d.poi_id
  left join administrative_areas aa
    on aa.id = d.administrative_area_id
  left join countries co
    on co.id = d.country_id
  left join lateral (
    select ci2.image_url
    from city_images ci2
    where ci2.city_id = d.city_id
      and ci2.image_type = 'hero'
      and ci2.is_active = true
    order by ci2.position asc
    limit 1
  ) ci on true
  left join lateral (
    select pi2.image_url
    from poi_images pi2
    where pi2.poi_id = d.poi_id
    order by pi2.display_order asc
    limit 1
  ) pi on true
  where cd.circuit_id = v_circuit.id;

  return jsonb_build_object(
    'id', v_circuit.id,
    'slug', v_circuit.slug,
    'countryId', v_circuit.country_id,
    'content', jsonb_build_object(
      'title', coalesce(v_content.title, ''),
      'subtitle', coalesce(v_content.subtitle, ''),
      'shortDescription', coalesce(v_content.short_description, ''),
      'introduction', coalesce(v_content.introduction, ''),
      'estimatedDuration', coalesce(v_content.estimated_duration, ''),
      'seoTitle', coalesce(v_content.seo_title, ''),
      'seoDescription', coalesce(v_content.seo_description, '')
    ),
    'destinations', v_destinations
  );
end;
$$;
