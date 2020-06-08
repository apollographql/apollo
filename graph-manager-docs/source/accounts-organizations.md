---
title: Accounts and organizations
---

Tasks related to managing Apollo Studio accounts and organizations are
described here.

## Accounts

### Creating your account

To create your Apollo account, visit [engine.apollographql.com](https://engine.apollographql.com) and click **Create an account**. You can sign
up either with an email and password, or with an existing GitHub account.

If you sign up with GitHub, Studio uses your GitHub identity only for
login verification purposes. It does not request access to any of your GitHub
data.

>Single sign-on (SSO) account management via SAML or OIDC is available for [Enterprise customers](https://www.apollographql.com/plans/).

Unless another Studio user has invited you to join an existing organization,
you also [create an organization](#creating-an-organization) as part of the account
creation process.

### Deleting your account

Deleting your account requires contacting Apollo. You can do so from your 
[Personal Settings page](https://engine.apollographql.com/user-settings).

## Organizations

All data in Studio (GraphQL schemas, metrics, etc.) belongs to a particular
**organization**. Every organization has one or more **members** who manage it
and can access its associated data.

> **Important:** Currently, all members of a Studio organization have full  permissions for the organization, including the ability to delete graphs or transfer them out of the organization.

### Creating an organization

You create your first organization as part of [account creation](#creating-your-account), unless you've been invited to an existing organization by another Studio user.

You can create additional organizations by clicking the `+` button at the top of your list of organizations in [Studio](https://engine.apollographql.com). A single Studio organization can include any number of graphs, so a company rarely needs more than
one or two organizations.

### Viewing your organizations

[Studio](https://engine.apollographql.com) lists the organizations you belong to in the left-hand column.

* Click on an organization to view its associated schemas and metrics.
* Click the gear icon next to an organization to view its settings.

### Inviting members

Invite organization members from the Member Management tab of your 
organization's settings. You can send invitations to individual email addresses
or create an **invite link** that anyone can use.

> **Do not share your invite link publicly.** Anyone with the link can join your organization. If your invite link becomes compromised, you can replace or disable it from the Member Management tab.

### Removing members

Remove organization members from the Member Management tab of your
organization's settings.

Currently, any member of an organization can remove any _other_ member
from the organization (but not themselves).

### Deleting an organization

Deleting an organization requires contacting Apollo. You can do so from the 
**Organization and Plan** tab of your organization's settings.

Deleting an organization does not affect the uptime of services that send data
to Studio as part of that organization.
