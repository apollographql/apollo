---
title: Accounts and organizations
---

Tasks related to managing Graph Manager accounts and organizations are
described here.

## Accounts

### Creating your account

To create your Graph Manager account, visit [engine.apollographql.com](https://engine.apollographql.com) and click **Create an account**. You can sign
up either with an email and password, or with an existing GitHub account.

If you sign up with GitHub, Graph Manager uses your GitHub identity only for
login verification purposes. It does not request access to any of your GitHub
data.

>Single sign-on (SSO) account management via SAML or OIDC is available for [Enterprise customers](https://www.apollographql.com/plans/).

Unless another Graph Manager user has invited you to join an existing organization,
you also [create an organization](#creating-an-organization) as part of the account
creation process.

### Deleting your account
Deleting your account requires contacting Apollo. You can do so from your 
[Personal Settings page](https://engine.apollographql.com/user-settings).

## Organizations

All data in Graph Manager (GraphQL schemas, metrics, etc.) belongs to a particular 
**organization**. Every organization has one or more **members** who manage it
and can access its associated data.

> **WARNING:** Currently, all members of a Graph Manager organization have full 
> permissions for the organization, including the ability to delete graphs or 
> transfer them out of the organization.

### Creating an organization

You create your first organization as part of 
[account creation](#creating-your-account), unless you've been invited to
an _existing_ organization by another Graph Manager user.

You can create additional organizations by clicking the `+` button at the top
of your list of organizations in the [Graph Manager UI](https://engine.apollographql.com). A single Graph Manager
organization can manage any number of schemas, so a company rarely needs more than
one or two organizations.

### Viewing your organizations

The [Graph Manager UI](https://engine.apollographql.com) lists the organizations you belong to in the left-hand column.

* Click on an organization to view its associated schemas and metrics.
* Click the gear icon next to an organization to view its settings.

### Inviting members

Invite organization members from the Member Management tab of your 
organization's settings. You can send 
invitations to individual email addresses or create an **invite link** that anyone can use.

> **Do not share your invite link publicly.** Anyone with the link can join your 
> organization. If your invite link becomes compromised, you can
> replace or disable it from the Member Management tab.

### Removing members

Remove organization members from the Member Management tab of your
organization's settings.

Currently, any member of an organization can remove any _other_ member
from the organization (but not themselves).

### Deleting an organization

Deleting an organization requires contacting Apollo. You can do so from the 
**Organization and Plan** tab of your organization's settings.

Deleting an organization does not affect the uptime of your services that send data
to Graph Manager as part of that organization.

## GitHub-synced organizations (LEGACY)

>Support for GitHub-synced organizations will end on **1 November 2019**. On this
>date, every remaining GitHub-synced organization will be migrated to a standard
>Graph Manager organization with the closest comparable [plan](https://www.apollographql.com/pricing/).
>
>You can migrate your GitHub-synced organization before this date by following
>[these steps](#migrating-a-github-synced-organization).

Graph Manager organizations created prior to **17 September 2019** are synced to
_GitHub_ organizations. If you belong to any legacy GitHub-synced organizations, they
appear in a separate list from your other organizations in the Graph Manager UI.

### Migrating a GitHub-synced organization

You can migrate a GitHub-synced organization to a standard Graph Manager organization
at any time.

Migrating has the following effects:

* The Graph Manager organization's list of members is no longer synced with the GitHub organization's list of members. Members are managed solely from Graph Manager.
* Any members of the GitHub organization who have _never_ logged in to Graph Manager are automatically _removed_ from the organization.
* The organization adopts the [pricing](https://www.apollographql.com/pricing/) of the plan you migrate to.

To migrate your organization:

1. From the [Graph Manager UI](https://engine.apollographql.com), go to the **Organization and Plan** tab of your organization's settings.
2. Click **Change Plans**.
3. Select an available plan and confirm your selection.

### Managing members in a GitHub-synced organization

You add or remove members from a GitHub-synced organization by 
adding or removing those members from the synced organization within GitHub.
Every member of a GitHub organization is automatically _also_ a member of the
corresponding Graph Manager organization (assuming they have created a Graph Manager 
account).

### Removing a GitHub-synced organization

You can view and revoke Graph Manager's access to your GitHub
organizations on [this GitHub page](https://github.com/settings/connections/applications/4c69c4c9eafb16eab1b5). Note that only owners of a GitHub organization can modify access.

By revoking Graph Manager's access to your GitHub organization, you remove the
corresponding GitHub-synced organization.

>Removing a GitHub-synced organization does _not_ delete its associated data. It
>_does_, however, remove all members from the organization. You must contact Apollo
>to receive access to a removed GitHub-synced organization.

### Permissions and privacy for GitHub-synced organizations

For management of GitHub-synced organizations, Graph Manager uses GitHub’s OAuth 
service to obtain read-only information about GitHub organizations and their 
members. Graph Manager does not request access rights to source code or to any other
sensitive data.
