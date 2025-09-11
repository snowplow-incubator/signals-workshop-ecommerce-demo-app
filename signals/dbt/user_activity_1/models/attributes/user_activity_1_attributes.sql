
{#
Copyright (c) 2025-present Snowplow Analytics Ltd. All rights reserved.
This program is licensed to you under the Snowplow Personal and Academic License Version 1.0,
and you may not use this file except in compliance with the Snowplow Personal and Academic License Version 1.0.
You may obtain a copy of the Snowplow Personal and Academic License Version 1.0 at https://docs.snowplow.io/personal-and-academic-license-1.0/
#}

{{
  config(
    materialized='table',
    dist=var('snowplow__attribute_key', 'domain_userid'),
    partition_by = snowplow_utils.get_value_by_target_type(bigquery_val = {
      "field": "valid_at_tstamp",
      "data_type": "timestamp"
    }, databricks_val='last_event_date'),
    sql_header=snowplow_utils.set_query_tag(var('snowplow__query_tag', 'snowplow_dbt')),
  )
}}

{%- set lower_limit, upper_limit = get_limits_for_attributes() %}

with  aggregations as (

  select 
    attribute_key
    , min(1) --dummy value in case there are no aggregate values in the view definitions

    
      , sum(sum_revenue_snowplow_ecommerce_action_type_eq_transaction) as sum_transaction_value_ltv
    
    


  from {{ ref('user_activity_1_daily_aggregates')}}

  group by 1
  
)




, window_calculations as (
  
  select distinct
    attribute_key


  
    , last_value(last_category) over (
                partition by attribute_key
                order by last_event_tstamp ASC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
            ) as last_product_category_purchased
  


  from {{ ref('user_activity_1_daily_aggregates')}}
  
)



select
    
  a.attribute_key as user_id,
  {{ snowplow_utils.current_timestamp_in_utc() }} as valid_at_tstamp,
  date({{ lower_limit }}) as lower_limit,
  date({{ upper_limit }}) as upper_limit
  

  -- time window based attributes
  
    
  -- lifetime based attributes
  
    , sum_transaction_value_ltv

  -- user lasts
  
    , w.last_product_category_purchased
  
  -- unique_list_attributes
  
from aggregations as a
left join window_calculations as w
on a.attribute_key = w.attribute_key


