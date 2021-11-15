---
title: Audit log of material Studio events
sidebar_title: Audit log (enterprise only)
description: Download a log of all material events that have occured in your account
---

As of July 2021, [Studio Enterprise](http://apollographql.com/pricing) offers an audit log of all material events that have ocurred in your organization. You can find the interface to request an export of auditable events under the **Audit** tab of your organization's homepage:

<img src="https://user-images.githubusercontent.com/5922187/127679934-e862077a-0ce0-4e3a-89db-ad9e621111ff.png" class="screenshot" alt="Apollo Studio audit log" />

## How it works

Actions taken in your organization appear in exported logs about 10-15 minutes after they occur. When creating an audit export, you can specify a **time range** and filter actions taken by a specific **user**, or actions taken on a specific **graph**. If you need to export a log with a complex filter, please contact us at [support@apollographql.com](mailto:support@apollographql.com).

Audit exports sometimes take a few minutes to process. When an export is ready, Studio emails you a link to it, and you can also find that link in the audit exports table. Audit export files are available to download for 30 days.

Only **Organization Admins** can request audit exports.

## Audited events

All material changes to your Studio account are logged in the audit log. This includes:
- Graph Changes
  - Graphs created and deleted
  - Graph titles, descriptions, or avatars changed
  - API keys created, renamed, or deleted
  - Datadog configuration changed
  - Hidden/visible property changed
  - Graph role overrides changed
  - Variants created

- User Changes
  - User added to or removed from org
  - User role changed in org
  - Beta features toggled on/off
  - User API keys created, renamed, or deleted
  - Password changed or password reset attempted
  - Avatar or email changed
  - Submitted a support ticket
  - Email verified
  - User deleted
