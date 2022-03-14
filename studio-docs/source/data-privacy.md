---
title: Apollo Studio data privacy and compliance
sidebar_title: Data privacy and compliance
description: Understand what Studio ingests and learn about GDPR
---

This article describes which data is and is _not_ sent to Apollo Studio by the other components of the Apollo platform.

Apollo Studio's top priority is ensuring the privacy and security of your data and your customers' data. No Apollo tool sends _any_ data to Apollo Studio unless you configure it to do so. Features that potentially send highly sensitive data require additional opt-in.

> Most importantly, result data from GraphQL operations that your server executes is **never** sent to Apollo.

## Which tools send data to Apollo Studio?

[Apollo Server](https://www.apollographql.com/docs/apollo-server/), the [Rover CLI](https://www.apollographql.com/docs/rover/), and the [Apollo CLI](https://www.apollographql.com/docs/devtools/cli/) have **opt-in features** that send data to Apollo Studio.

The Rover CLI also collects anonymous usage data by default. [You can disable this.](https://www.apollographql.com/docs/rover/privacy/)

Apollo Client does **not** send data to Apollo Studio.

## Where is data sent?

All data sent to Apollo Studio is sent to an endpoint with one of the following base URLs:

| Base URL | Used by |
|----------|---------|
| **Latest URLs** |
| `https://usage-reporting.api.apollographql.com` | Metrics reporting from [Apollo Server](/metrics/usage-reporting/#pushing-metrics-from-apollo-server) (v2.18.0+) and [third-party API servers](/metrics/usage-reporting/#third-party-support) |
| `https://schema-reporting.api.apollographql.com` | Schema registration via schema reporting in [Apollo Server](/schema/schema-reporting/#apollo-server-setup) (v2.18.0+) and [third-party API servers](/schema/schema-reporting/#other-graphql-servers) |
| `https://graphql.api.apollographql.com` | All [Apollo CLI](https://www.apollographql.com/docs/devtools/cli/) (v2.31+) commands and [Rover CLI](https://www.apollographql.com/docs/rover/) commands that communicate with Studio (and the Studio web UI) |
| `https://operations.api.apollographql.com` | Apollo Server with the [operation registry plugin](/operation-registry/) (v0.4.1+) |
| `https://storage-secrets.api.apollographql.com` | Apollo Server with Apollo Gateway (v0.16.0-v0.33.0) with [managed federation](https://www.apollographql.com/docs/federation/managed-federation/overview/), or with the [operation registry plugin](/operation-registry/) (v0.4.1+) |
| `https://uplink.api.apollographql.com` | Apollo Server with Apollo Gateway (v0.34.0+) with [managed federation](https://www.apollographql.com/docs/federation/managed-federation/overview/) |
| `https://aws.uplink.api.apollographql.com` | Apollo Server with Apollo Gateway (v0.45.0+) with [managed federation](https://www.apollographql.com/docs/federation/managed-federation/overview/) |
| **Active legacy URLs** |
| `https://engine-report.apollodata.com` | Metrics reporting from Apollo Server (v2.0-2.17.x) |
| `https://edge-server-reporting.api.apollographql.com` | Schema registration via schema reporting in Apollo Server (v2.15.0-2.17.x) |
| `https://engine-graphql.apollographql.com` | All Apollo CLI (v2.30 and earlier) commands that communicate with Studio |
| `https://storage.googleapis.com` | Apollo Server with Apollo Gateway (v0.15.1 and earlier) with [managed federation](https://www.apollographql.com/docs/federation/managed-federation/overview/), or with the [operation registry plugin](/operation-registry/) (v0.3.1 and earlier) |
| `https://federation.api.apollographql.com` | Apollo Server with Apollo Gateway (v0.16.0-v0.33.0) with [managed federation](https://www.apollographql.com/docs/federation/managed-federation/overview/) |


If your environment uses a corporate proxy or firewall, you might need to configure it to allow outbound traffic to these domains. Note that data might be sent to multiple endpoints in a given domain.

## What data does Apollo Server send to Apollo Studio?

You can configure Apollo Server to trace the execution of each GraphQL operation and [push those metrics to Apollo Studio](/metrics/usage-reporting/). Studio uses this trace data to reconstruct both operation-level timing data for given query shapes and field-level timing data for your overall schema. This data is available for you to explore and visualize in Studio.

You can also configure Apollo Server to [report its schema to the Apollo registry](./schema/schema-reporting).

_All_ data sent from Apollo Server to Studio is transmitted using HTTPS on port 443, and HTTP traffic on port 80 is disabled.

### Per-operation data

**Apollo Server never sends the `data` field of an operation response to Apollo Studio.** It _does_ send:

* Several fields _besides_ `data` from every operation response

* The [query operation string](#query-operation-strings) for every executed operation

* The time it takes each resolver to execute for every operation

Additionally, you can configure Apollo Server to forward some or all of:

* Every operation's [GraphQL variables](#graphql-variables) and [HTTP headers](#http-headers)

### Operation response fields

Let’s walk through Apollo Server's default behavior for reporting on fields in a typical GraphQL response:

```json
// GraphQL Response
{
  "data": { ... },          // NEVER sent to Apollo Studio.
  "errors": [ ... ] 
  // Sent to Studio, used to report on errors for operations and fields.
}
```

#### `response.data`

As mentioned, Apollo Server **never** sends the contents of this field to Graph
Manager. The responses from your GraphQL service stay internal to your application.

#### `response.errors`

By default, if Apollo Server sees a response that includes an `errors` field, it reports the values of the error's `message` and `locations` fields (if any) to Apollo Studio.

You can use the [usage reporting plugin's `rewriteError` option](https://www.apollographql.com/docs/apollo-server/api/plugin/usage-reporting/#rewriteerror) to filter or transform errors before they're stored in Studio. Use this to strip sensitive data from errors or filter "safe" errors from Studio reports.

### Query operation strings

Apollo Server reports the string representation of each query operation to Apollo Studio. Consequently, **do not include sensitive data (such as passwords or personally identifiable information) in operation strings**. Instead, include this information in [GraphQL variables](#graphql-variables), which you can send selectively.

### GraphQL variables

#### Apollo Server 2.7.0 and later

In Apollo Server 2.7.0 and later, **none** of an operation's GraphQL variables are sent to Apollo Studio by default.

You can set a value for the [usage reporting plugin's `sendVariableValues` option](https://www.apollographql.com/docs/apollo-server/api/plugin/usage-reporting/#sendvariablevalues) to specify a different strategy for reporting some or all of your GraphQL variables.

#### Versions prior to 2.7.0

In versions of Apollo Server 2 _prior_ to 2.7.0, **all** of an operation's GraphQL
variables are sent to Apollo Studio by default.

If you're using an earlier version of Apollo Server, it's recommended that you update. If you can't update for whatever reason, you can use the [`privateVariables` reporting option](https://www.apollographql.com/docs/apollo-server/migration-engine-plugins/#options-for-apolloserverpluginusagereporting) to specify the names of variables that should _not_ be sent to Studio. You can also set this option to `false` to prevent all variables from being sent. This reporting option is deprecated and will not be available in future versions of Apollo Server.

### HTTP Headers

Regardless of your server configuration, Apollo Studio **never** collects the values
of the following HTTP headers, even if they're sent:

* `Authorization`
* `Cookie`
* `Set-Cookie`

You can, however, configure reporting options for all other HTTP headers.

> **Important:** If you perform authorization in a header other than those listed above (such as `X-My-API-Key`), **do not send that header to Studio**.

#### Apollo Server 2.7.0 and later

In Apollo Server 2.7.0 and later, **none** of an
operation's HTTP headers is sent to Apollo Studio by default.

You can set a value for the [usage reporting plugin's `sendHeaders` option](https://www.apollographql.com/docs/apollo-server/api/plugin/usage-reporting/#sendheaders) to specify a different strategy for reporting
some or all of your HTTP headers.

#### Versions prior to 2.7.0

In versions of Apollo Server 2 _prior_ to 2.7.0, **all** of an operation's HTTP headers
(except the confidential headers listed [above](#http-headers)) are sent to Apollo Studio by default.

If you're using an earlier version of Apollo Server, it's recommended that you
update. If you can't update for whatever reason, you can use the [`privateHeaders` reporting option](https://www.apollographql.com/docs/apollo-server/migration-engine-plugins/#options-for-apolloserverpluginusagereporting) to specify the names of variables that should _not_ be sent to Studio. You can also set this option to `false` to prevent all headers from being sent. This reporting option is deprecated and will not be available in future versions of Apollo Server.

## What data does Apollo Studio log about operations executed in the Explorer?

**Only front-end usage metrics for improving the product.** The [Apollo Studio Explorer](./explorer/explorer/) enables you to build and execute operations against your GraphQL server. These operations are sent directly from your browser and **do not** pass through Studio servers.

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

The legal terms and policies that apply to Apollo's corporate websites and customer products or services are available at https://www.apollographql.com/Apollo-Website-Terms-of-Service.pdf and https://www.apollographql.com/Apollo-Terms-of-Service.pdf.

#### Where can I get more help?

If you have any questions (including interest in a Data Processing Addendum or DPA), or encounter any issues, please reach out to [support](https://studio.apollographql.com/support).

## Requesting deletion of data

To request the deletion of specific data from your Apollo Studio organization, please email **support@apollographql.com** with the subject `Data deletion request`.

In your email, please include the following:

* A description of the data that needs to be deleted
* An approximate timestamp of when that data was reported to Apollo
* The ID of the Apollo Studio graph that the data is associated with

> **Important:** Currently, data deletion is performed across _all variants_ of an affected graph. Per-variant deletion is not available.

You can also request that members of your organization be removed from marketing outreach. To do so, provide the email addresses of those members in your email.

<!--
######################################################################
Policies and Agreements
######################################################################
-->

## Policies and Agreements

To learn about other ways that we protect your data, please read over our [Terms of Service](https://www.apollographql.com/Apollo-Terms-of-Service.pdf) and [Privacy Policy](https://www.apollographql.com/Apollo-Privacy-Policy.pdf).
