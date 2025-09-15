
{#Copyright (c) 2025-present Snowplow Analytics Ltd. All rights reserved.
This program is licensed to you under the Snowplow Personal and Academic License Version 1.0,
and you may not use this file except in compliance with the Snowplow Personal and Academic License Version 1.0.
You may obtain a copy of the Snowplow Personal and Academic License Version 1.0 at https://docs.snowplow.io/personal-and-academic-license-1.0/
#}

{{
    config(
        tags=["this_run"],
        materialized="table",
        sql_header=snowplow_utils.set_query_tag(var('snowplow__query_tag', 'snowplow_dbt')),
        unique_key=['attribute_key_date_id']
    )
}}

with events as (
  select e.* 
  from {{ ref('user_activity_1_filtered_events') }} e
  inner join {{ ref('user_activity_1_days_to_process') }} d
      on date(e.derived_tstamp) = d.event_date
)

, aggregations as (
  
  select
    attribute_key_date_id,
    attribute_key,
    event_date
    
    
      
        , sum(
      
        case when  event_name IN('snowplow_ecommerce_action') and  type = 'transaction' then cast(revenue as {{ dbt.type_float()}}) else 0 end) as sum_revenue_snowplow_ecommerce_action_type_eq_transaction
    
    
  from events
  group by 1,2,3
)

--TODO: consider separating them to user_lasts and user_firsts to avoid having to do multiple window functions if these fields get bigger and the query optimizer does not catch them
, window_calculations as (
  
  select
    *,
    last_value(derived_tstamp) over (partition by attribute_key_date_id order by derived_tstamp ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) as last_event_tstamp
        
    
    
      , last_value(category) over (partition by attribute_key_date_id order by derived_tstamp ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) as last_category
  
  from events
  
)

select distinct
  a.attribute_key_date_id,
  a.attribute_key,
  a.event_date,
  w.last_event_tstamp

    
    , a.sum_revenue_snowplow_ecommerce_action_type_eq_transaction
  
  
    
  
    
    , w.last_category

from aggregations a

left join window_calculations w
on w.attribute_key_date_id = a.attribute_key_date_id

