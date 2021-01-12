---
title: Setup
sidebar_title: Setup
---

Apollo Studio can send notifications about your data graph to your team. This helps you stay up to date on changes to your graph's schema and performance as soon as they occur.

Apollo supports sending the following notifications:

- [Daily reports](./daily-reports) of your graph's request rate, error rate, and latency
- [Schema change notifications](./schema-change-integrations) whenever your graph's schema is updated
- [Performance alerts](./performance-alerts) whenever a metric such as error percentage or request latency exceeds a particular threshold (this feature requires a [paid plan](https://www.apollographql.com/pricing/))

Apollo can send notifications to Slack Workspaces, Pagerduty Services, or to arbitrary webhooks. Each notification sink accpets the following notifications:

| Notification                      | Webhook (Enterprise) | Slack | Pagerduty |
| :-------------------------------- | :------------------: | :---: | :-------: |
| Performance Alerts (Experimental) |                      |   ✓   |     ✓     |
| Daily Reports                     |                      |   ✓   |           |
| Schema Change Notifications       |          ✓           |   ✓   |           |

## Slack integration setup

> If you don't have an Apollo account yet, [get started](getting-started/).

To set up Slack notifications, you first configure an incoming webhook in Slack, then provide that webhook's URL to Apollo Studio.

### 1. Create an incoming Slack hook

To create an incoming webhook:

1. From the [Incoming Hooks](https://slack.com/apps/A0F7XDUAZ-incoming-webhooks) page of the Slack App Directory, sign in and click **Add to Slack**.
2. Select the channel that should receive Studio notifications and click **Add Incoming WebHooks integration**.
3. Copy the **Webhook URL** (has the format `https://hooks.slack.com/services/...`) for use in the [next step](#2-provide-the-webhook-to-studio).

You can repeat this process to create webhook URLs for multiple channels.

### 2. Provide the hook to Studio

From [Apollo Studio](https://studio.apollographql.com):

<img src="./img/integrations/slack_creation.png" class="screenshot" alt="Slack Creation Modal">

1. Specify the name of the Slack channel you want to push notifications to. Names must be unique across all channels in a graph
2. In the Slack Webhook URL field, paste the webhook URL you obtained in [Create an incoming webhook](#1-create-an-incoming-webhook).
3. Click **Done**.
4. Verify that your selected Slack channel receives a confirmation notification from Studio.

To configure notifications for multiple Slack channels, repeat this process with a different corresponding webhook URL each time.

## Webhook integration setup 

### <img src="./img/integrations/webhook_creation.png" class="screenshot" alt="Webhook creation modal">

1. Specify the name of the Webhook channel you want to push notifications to. Names must be unique across all channels in a graph
2. Add the url that
3. Click **Done**.
4. Verify that your selected Slack channel receives a confirmation notification from Studio.

To configure notifications for multiple Slack channels, repeat this process with a different corresponding webhook URL each time.

## Pagerduty integration setup

TODO