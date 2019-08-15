---
title: Graph Manager data privacy and compliance
description: Understand what Graph Manager ingests and learn about GDPR
---

You can configure Apollo Server to automatically trace the execution of your requests and forward that information to Graph Manager. Graph Manager uses this trace data to reconstruct both operation-level timing data for given query shapes and field-level timing data for your overall schema. This data is available for you to explore and visualize in the Graph Manager interface.

## What data does Apollo Server send to Graph Manager?

**Apollo Server never forwards the `data` of an operation response to Graph Manager.** It _does_ forward:

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
Manager. The responses from your GraphQL service stay internal to your application.

#### `response.errors`

By default, if Apollo Server sees a response that includes an `errors` field, it reports the values
of the error's `message` and `locations` fields (if any) to Graph Manager.

You can use the [`rewriteError` reporting option](/apollo-server/api/apollo-server/#enginereportingoptions) to filter or transform errors before they're stored in
Graph Manager. Use this to strip sensitive data from errors or filter "safe" errors from Graph Manager reports.

### Query operation strings

Apollo Server reports the string representation of each
query operation to Graph Manager. Consequently, **do not include sensitive data (such
as passwords or personally identifiable information) in operation strings**. Instead, include this information in [GraphQL variables](#graphql-variables), which you can send selectively.

### GraphQL variables

#### Apollo Server 2.7.0 and later

In Apollo Server 2.7.0 and later, **none** of an
operation's GraphQL variables is sent to Graph Manager by default.

You can set a value for the [`sendVariableValues` reporting option](/apollo-server/api/apollo-server/#enginereportingoptions) to specify a different strategy for reporting
some or all of your GraphQL variables.

#### Versions prior to 2.7.0

In versions of Apollo Server 2 _prior_ to 2.7.0, **all** of an operation's GraphQL
variables are sent to Graph Manager by default.

If you're using an earlier version of Apollo Server, it's recommended that you
update. If you can't update for whatever reason, you can use the
 [`privateVariables` reporting option](/apollo-server/api/apollo-server/#enginereportingoptions)
to specify the names of variables that should _not_ be sent to Graph Manager. You
can also set this option to `false` to prevent all variables from being sent.
This reporting option is deprecated and will not be available in future versions of Apollo Server.

### HTTP Headers

Regardless of your server configuration, Graph Manager **never** collects the values
of the following HTTP headers, even if they're sent:

* `Authorization`
* `Cookie`
* `Set-Cookie`

You can, however, configure reporting options for all other HTTP headers.

> **Important:** If you perform authorization in a header other than those listed above
> (such as `X-My-API-Key`), **do not send that header to Graph Manager**.

#### Apollo Server 2.7.0 and later

In Apollo Server 2.7.0 and later, **none** of an
operation's HTTP headers is sent to Graph Manager by default.

You can set a value for the [`sendHeaders` reporting option](/apollo-server/api/apollo-server/#enginereportingoptions) to specify a different strategy for reporting
some or all of your HTTP headers.

#### Versions prior to 2.7.0

In versions of Apollo Server 2 _prior_ to 2.7.0, **all** of an operation's HTTP headers
(except the confidential headers listed above) are sent to Graph Manager by default.

If you're using an earlier version of Apollo Server, it's recommended that you
update. If you can't update for
whatever reason, you can use the [`privateHeaders` reporting option](/apollo-server/api/apollo-server/#enginereportingoptions) to specify the names of variables
that should _not_ be sent to Graph Manager. You can also set this
option to `false` to prevent all headers from being sent.
This reporting option is deprecated and will not be available in future versions of Apollo Server.

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
