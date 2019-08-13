---
title: Apollo Graph Manager overview
description: Account management, graph management, data privacy, and GDPR compliance
---

Apollo Graph Manager (formerly Apollo Engine) is a cloud service for managing
and monitoring your organization's data graph. In addition to serving as a [GraphQL schema registry](/docs/platform/schema-registry/), Graph Manager ingests operation metadata and execution trace data from your GraphQL server to provide valuable insights into schema and query usage.

Graph Manager's core schema management features are available in an unlimited capacity for free, and they always will be. Advanced features are available with a subscription to an Apollo Team or Enterprise plan. These features include:

* [Operation safelisting](/docs/platform/operation-registry/)
* [Schema change validation](/docs/platform/schema-validation/)
* [Resolver-level query tracing](/docs/platform/performance/)
* [Third-party integrations](/docs/platform/integrations/)
* Longer data retention

[Learn more about pricing and billing](https://www.apollographql.com/plans/)

![The Apollo Graph Manager Architecture](../img/apollo-engine/engine-architecture.png)

## Creating an account

You create your Graph Manager account by authenticating with your GitHub account at [engine.apollographql.com](https://engine.apollographql.com). Your Graph Manager username is the same as your GitHub username.

>Single sign-on (SSO) account management via SAML or OIDC is available for [Enterprise customers](https://www.apollographql.com/plans/).

## Managing organizations

All data in Graph Manager belongs to a particular **organization**.

### Your personal organization

When you create your
Graph Manager account via GitHub, a **personal organization** is created for you with the
same name as your GitHub username. Other users cannot join your personal organization.
Feel free to use this organization to try out the features of Graph Manager.

### Team organizations

Graph Manager supports **team organizations** that mirror GitHub organizations. When you first log in to Graph Manager, it requests permission to view which GitHub organizations you belong to, along with the members and teams in those organizations (but **not** the code). When Graph Manager first receives permission to view a particular GitHub organization, it creates a Graph Manager organization with the same name.

Every member of a GitHub organization automatically has access to the corresponding Graph Manager organization (assuming they create a Graph Manager account).

> **WARNING: Currently, all members of a Graph Manager organization have full permissions
> for the organization, including the ability to delete graphs or transfer them
> out of the organization.**

#### Adding and removing organization members

To add or remove members from a Graph Manager organization, simply add or remove those
same  members from the corresponding GitHub organization. Note that only the owner
of a GitHub organization can remove members.

### Viewing your organizations

The [Graph Manager homepage](https://engine.apollographql.com) lists the organizations you belong to in the left-hand column.
Click on an organization to view its associated data.

If you’re a member of a GitHub organization and you don't see a corresponding organization in Graph Manager, it's probably because Graph Manager doesn't currently have read access for that organization.

### Creating and removing organizations

You can view and modify Graph Manager's current access to your GitHub
organizations on [this GitHub page](https://github.com/settings/connections/applications/4c69c4c9eafb16eab1b5). Note that only owners of a GitHub organization can modify access.

* To create a Graph Manager organization for a particular GitHub organization, simply
grant Graph Manager access to the GitHub organization.

* To remove a Graph Manager organization, simply revoke Graph Manager's access to
the corresponding GitHub organization.

### GitHub permissions and privacy

Graph Manager uses GitHub’s OAuth service to obtain read-only information about organizations and users. Graph Manager does not request access rights to your source code or to any other sensitive data.

## Managing graphs

A **graph** in Graph Manager represents the data graph for a single project or application. Every graph has its own associated GraphQL schema. 

### Creating a graph

To create a graph in the Graph Manager interface, first select the Graph Manager organization
that the graph will belong to. Then click **New Graph** in the upper right and
proceed through the creation flow.

Note that every graph in Graph Manager has a globally unique **graph ID**. We recommend that you prefix your graph IDs with the name of your company or organization to avoid naming collisions.

### Viewing graph information

After selecting an organization in Graph Manager, click on a particular graph
to view its data and settings. All of a Graph Manager organization's members have
access to the data and settings for every graph that belongs to that organization. 

### Transferring graph ownership

You can transfer a graph to a different Graph Manager organization you belong to
by visiting the graph's Settings page and changing the **graph owner**.

### Deleting a graph

>**Deleting a graph cannot be undone!**

You can delete a graph from Graph Manager by visiting its Settings page and clicking
**Delete**.

### Distinguishing between application environments

Every graph in Graph Manager should correspond to a single application. However, a single
application might run in multiple _environments_ (such as test, staging, and production).

To distinguish between graph activity for different application environments, you can define [**variants**](https://www.apollographql.com/docs/platform/schema-registry.html#schema-tags) for a graph. Each variant has its own schema
that can (but doesn't have to) differ from the default variant.

When your server sends metrics to Graph Manager, it can associate an operation with
a particular variant. Variants appear as separate items in your organization's graph list, allowing you to view analytics for 
each application environment in isolation.

## Ingesting and fetching data

Graph Manager ingests and stores performance metrics data sent from your GraphQL server.
Use one of the following methods to send data to Graph Manager:

* Use [Apollo Server](/docs/apollo-server/) as your application's GraphQL server and [include a Graph Manager API key](/docs/tutorial/production/#get-an-engine-api-key) in your server configuration.

* If you aren't using Apollo Server, you can send trace metrics to the [Graph Manager reporting endpoint](/references/setup-analytics/#engine-reporting-endpoint) (again,
providing an API key with every request).

### API keys

Any system that communicates with Graph Manager (whether to send metrics or fetch them)
must use an **API key** to do so. You can add and remove API keys from your graph
from its Settings page in the Graph Manager UI.

You should use a different API key for each system that communicates
with Graph Manager. This provides you with more granular control over how Graph
Manager data is sent and accessed.

## Data transfer and privacy

You can configure Apollo Server to automatically trace the execution of your requests and forward that information to Graph Manager. Graph Manager uses this trace data to reconstruct both operation-level timing data for given query shapes and field-level timing data for your overall schema. This data is available for you to explore and visualize in the Graph Manager interface.

### What does Apollo Server send to Graph Manager?

 

**Apollo Server never forwards the `data` of an operation response to Graph Manager.** It _does_ forward:

* Several fields _besides_ `data` from every operation response

* The [query operation string](#query-operation-strings) for every executed operation

* The time it takes each resolver to execute for every operation

Additionally, you can configure Apollo Server to forward some or all of:

* Every operation's [GraphQL variables](#graphql-variables) and [HTTP headers](#http-headers)

#### Operation response fields

Let’s walk through Apollo Server's default behavior for reporting on fields in a typical GraphQL response:

```json
// GraphQL Response
{
  "data": { ... },          // NEVER sent to Graph Manager.
  "errors": [ ... ],        // Sent to Graph Manager, used to report on errors for operations and fields.
  "extensions": {
    "tracing": { ... },     // Sent to Graph Manager, used to report on performance data for operations and fields.
    "cacheControl": { ... } // Sent to Graph Manager, used to determine cache policies and forward CDN cache headers.
  }
}
```

#### `response.data`

As mentioned, Apollo Server **never** sends the contents of this field to Graph
Manager. The responses from your GraphQL service stay on-prem.

#### `response.errors`

By default, if Apollo Server sees a response that includes an `errors` field, it reports the values
of the error's `message` and `locations` fields (if any) to Graph Manager.

You can use the [`rewriteError` reporting option](/docs/apollo-server/api/apollo-server/#enginereportingoptions) to filter or transform errors before they're stored in
Graph Manager. Use this to strip sensitive data from errors or filter "safe" errors from Graph Manager reports.

#### Query operation strings

Apollo Server reports the string representation of each
query operation to Graph Manager. Consequently, **do not include sensitive data (such
as passwords or personally identifiable information) in operation strings**. Instead, include this information in [GraphQL variables](#graphql-variables), which you can send selectively.

#### GraphQL variables

##### Apollo Server 2.7.0 and later

In Apollo Server 2.7.0 and later, **none** of an
operation's GraphQL variables is sent to Graph Manager by default.

You can set a value for the [`sendVariableValues` reporting option](/docs/apollo-server/api/apollo-server/#enginereportingoptions) to specify a different strategy for reporting
some or all of your GraphQL variables.

##### Versions prior to 2.7.0

In versions of Apollo Server 2 _prior_ to 2.7.0, **all** of an operation's GraphQL
variables are sent to Graph Manager by default.

If you're using an earlier version of Apollo Server, it's recommended that you
update. If you can't update for
whatever reason, you can use the [`privateVariables` reporting option](/docs/apollo-server/api/apollo-server/#enginereportingoptions) to specify the names of variables
that should _not_ be sent to Graph Manager. This reporting option is deprecated
and will not be available in future versions of Apollo Server.

#### HTTP Headers

Regardless of your server configuration, Graph Manager **never** collects the values
of the following HTTP headers, even if they're sent:

* `Authorization`
* `Cookie`
* `Set-Cookie`

You can, however, configure reporting options for all other HTTP headers.

> If you perform authorization in another header (such as `X-My-API-Key`), **do not send
>that header to Graph Manager**.

##### Apollo Server 2.7.0 and later

In Apollo Server 2.7.0 and later, **none** of an
operation's HTTP headers is sent to Graph Manager by default.

You can set a value for the [`sendHeaders` reporting option](/docs/apollo-server/api/apollo-server/#enginereportingoptions) to specify a different strategy for reporting
some or all of your HTTP headers.

##### Versions prior to 2.7.0

In versions of Apollo Server 2 _prior_ to 2.7.0, **all** of an operation's HTTP headers
(except the confidential headers listed above) are sent to Graph Manager by default.

If you're using an earlier version of Apollo Server, it's recommended that you
update. If you can't update for
whatever reason, you can use the [`privateHeaders` reporting option](/docs/apollo-server/api/apollo-server/#enginereportingoptions) to specify the names of variables
that should _not_ be sent to Graph Manager. This reporting option is deprecated
and will not be available in future versions of Apollo Server.

<!--
######################################################################
GDOR
######################################################################
-->

## GDPR

Effective May 25, 2018, the General Data Protection Regulation (GDPR) expands European Union (EU) residents’ (Data Subjects) rights concerning their personal data. Meteor Development Group Inc. (“MDG” also dba Apollo) stands ready to assist our customers to become or remain compliant with GDPR after this crucial transition.

#### What is GDPR?

GDPR standardizes EU regulations and expands the rights of Data Subjects pertaining to personal data while expanding the definition of what constitutes personal data. GDPR provides Data Subjects with increased rights to control and delete their personal data, and it broadly prohibits the processing of special categories of personal data.

#### How has Apollo prepared for GDPR?

We have been complying with GDPR since before it became enforceable on May 25, 2018. We are enhancing our products, processes, and procedures to meet our obligations as a data processor (Processor).

#### How will GDPR affect the way companies use Apollo's products or services?

Our products and services are not intended to be used for processing personal data. Our products and services are focused on software, systems, and applications - not individuals. If a customer wishes to set up a custom API, custom attribute, or custom event to track such data, it may do so. Our processing is data agnostic and automated, so all data is processed in the same way in accordance with a customer’s configuration. If, however, a customer believes that it has included personal data in the information processed by Apollo, we will assist the customer in meeting its obligations in accordance with the requirements of GDPR and the terms of our Data Processing Agreement.

#### How can Apollo assist customers in meeting their obligations under GDPR?

As a Processor, we will assist customers in fulfilling their obligations as data controllers (Controllers) by:

- supporting customers in complying with requests from Data Subjects
- aggregating applicable personal data for customers replying to complaints from Data Subjects
- replying to investigations and inquiries from supervisory authorities concerning processing activities on behalf of a customer
- conducting Data Protection Impact Assessments

#### How can Apollo help address requests from Data Subjects?

Apollo has implemented a process to intake, review, and fulfill customer requests arising from Data Subject Access Requests (DSAR) they receive. As a result of a DSAR, customers might request that Apollo securely delete or return the Data Subject’s personal data. Due to their sensitivity, such requests will be handled by Apollo on a case-by-case basis.

#### Where can I learn more about Apollo's security and privacy policies?

The legal terms and policies that apply to Apollo's corporate websites and customer products or services are available at https://www.meteor.com/policy.

#### Where can I get more help?

If you have any questions (including interest in a Data Processing Addendum or DPA), or encounter any issues, please reach out to [support](https://engine.apollographql.com/support).

<!--
######################################################################
Policies and Agreements
######################################################################
-->

## Policies and Agreements

To learn about other ways that we protect your data, please read over our [Terms of Service](https://www.apollographql.com/policies/terms) and [Privacy Policy](https://www.apollographql.com/policies/privacy).
