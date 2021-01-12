---
title: Daily reports
sidebar_title: Daily reports
---

Apollo Studio sends your graph's daily report around 9am in your specified time zone. The report provides a high-level summary of what your GraphQL API delivered in the previous day:

<img src="./img/integrations/slack-report.png" alt="Slack daily report" class="screenshot"></img>

### Acting on report data

The daily report provides an actionable summary of what's happened in your API over the last 24 hours. Here’s how you can use it to identify issues:

- **Request rate:** This shows you how many queries are hitting your server every minute, along with a list of the most popular operations. If you see a significant dip in this value, it might mean that queries aren’t able to reach your server, or that a particular client is down.
- **p95 service time:** An operation's p95 response time indicates that 95% of that operation's executions complete _faster_ than the reported value. You can use this to identify that your API is overloaded and users are seeing long loading delays, or to find out which queries are taking the longest to run. This is often connected to UI performance, so a 500ms query probably means some part of your UI is taking that long to display.
- **Error percentage:** This shows you how many of your GraphQL requests produce an error result, along with a list of the operations with the highest error percentage. Spikes in errors might be the result of an underlying back-end malfunction.

## Setup

## Setup

> If you don't have an Apollo account yet, [get started](getting-started/). 

1. Navigate to the notifications tab under graph settings and scroll to the bottom of the page
2. Click `Add Notification`
3. Select `Daily Report` in the first step of the modal then hit `Next` 
4. Chose the variant from where the report information is aggregated and a timezone. The report will be sent at 9AM in whatever timezone is selectied
5. Then select channel that notifications should be sent to new channels can also be created here. Only slack channels are supported for daily reports [setup](./notification-setup)