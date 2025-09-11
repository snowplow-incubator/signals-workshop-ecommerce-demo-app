{#
Copyright (c) 2025-present Snowplow Analytics Ltd. All rights reserved.
This program is licensed to you under the Snowplow Personal and Academic License Version 1.0,
and you may not use this file except in compliance with the Snowplow Personal and Academic License Version 1.0.
You may obtain a copy of the Snowplow Personal and Academic License Version 1.0 at https://docs.snowplow.io/personal-and-academic-license-1.0/
#}

{% macro get_limits_for_attributes() -%}

  {# upper limit only applies to last n day aggregates in case the user does not want to include current date in the aggregations #}
  {# TODO: implement lower limit for reducing unnecessary scans in case there are only last n day aggregate attributes #}

  
  {% if var('snowplow__mock_current_day', false) %}
    {% set current_day = "DATE '" ~ var("snowplow__mock_current_day") ~ "'" %}
  {% else %}
    {% if target.type == "snowflake" %}
      {% set current_day = "CAST(CONVERT_TIMEZONE('UTC', CURRENT_TIMESTAMP()) AS DATE)" %}
    {% elif target.type == "bigquery" %}
      {% set current_day = "CURRENT_DATE" %}
    {% endif %}
  {% endif %}

  {# Calculate upper limit depending on include_current_day #}
  {% if var("snowplow__include_current_day_in_windows", false) %}
    {% set upper_limit = snowplow_utils.add_days_to_date(1, current_day) %}
  {% else %}
    {% set upper_limit = current_day %}
  {% endif %}

  {# Static lower limit from var #}
  {% set lower_limit = "DATE '" ~ var("snowplow__start_date", "2025-01-01") ~ "'" %}

  {% if execute %}
    {{ return([lower_limit, upper_limit]) }}
  {% else %}
    {{ return(["", ""]) }}
  {% endif %}
  
{% endmacro %}

