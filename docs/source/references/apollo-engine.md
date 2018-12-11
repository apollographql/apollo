---
title: Apollo Engine guide
description: Account management, data privacy, GDPR compliance, and other information about Apollo Engine
---

[Apollo Engine](https://engine.apollographql.com/) is our cloud service for schema management and performance metrics monitoring. Its foundation is built on two types of data input from servers: publishing schema introspections and sending traces of request execution. From those two data inputs we can provide rich schema usage insights, schema history management, schema change valiation, query usage insights, and more.

Engine's core schema management features are all availble in an unlimited capacity for free, and always will be. Engine's advanced features, like resolver-level query tracing, longer data retention, and third-party integrations are available with subscriptions to the Apollo Team plan.

More information on pricing and billing can be found [here](https://www.apollographql.com/plans/).
<!-- You can get started with Engine using any GraphQL server by visiting our setup guide [here](/docs/references/setup-analytics.html). -->

![The Apollo Engine Architecture](../img/apollo-engine/engine-architecture.png)

<!--
######################################################################
Accounts
######################################################################
-->

<h2 id="accounts">Accounts</h2>

Engine accounts are authenticated using GitHub by default. There is also an SSO login option for teams that can be requested by [contacting us](https://www.apollographql.com/contact-sales/).

<h3 id="team-collaboration">Team collaboration</h3>

Engine accounts mirror your GitHub organizations. The first time you log in, we create a personal Engine account for you with the same name as your GitHub username.

The Engine GitHub application asks for permission to read which GitHub organizations you’re in and their members and teams (but not code!). If you grant Engine permission to see an organization, we create an Engine account with the same name as that GitHub organization. All members of that organization on GitHub will be able to see the new account in Engine. This is how you create a shared team account in Engine.

When you sign in to Engine, you will have access to all the teams where you're a member of the organization on GitHub. You can use the organization account picker to switch between accounts. If another member of a GitHub organization you belong to has already signed up the GitHub organization for Engine access, you’ll have access to that existing account.

If you’d like to work with additional team members and you are the admin of a GitHub organization, simply add them to your GitHub organization. If you aren’t an admin, have an admin add you to their GitHub organization.

<h3 id="add-organization">Adding an organization</h3>

If you’re looking for a GitHub organization that you’re a member of and don’t see it in Engine, it’s likely that Engine does not have read access for that organization.

If you want to add or remove an organization from Engine, you should manage those settings on GitHub. There, you will be able to Grant or Revoke access to Engine for organizations you can administer. For organizations you do not administer, you can Request access to Engine and the administrators will receive a request by E-mail.

<h3 id="github-permissions">GitHub permissions</h3>

GitHub’s OAuth service is used for read-only information about organizations and users. Engine does not need access rights to your source code or to any other sensitive data in its login system.

If your Engine account is owned by a GitHub organization, then Engine will allow all members of that organization to access the account. As you add or remove team members from your Github org, Engine will know about that and accordingly update the authorization for those users.

<h3 id="other-logins">Support for non-GitHub login</h3>

Engine was built to mirror GitHub’s login and does not currently support other forms of login or team creation. Our current recommendation for teams who want to use Engine but do not use GitHub is:

1. Create a free GitHub organization (empty, public).
2. Add your desired team members to the organization.
3. Hide membership of the organization if desired.
4. Use this organization to collaborate on Engine.

<!--
######################################################################
Services
######################################################################
-->

<h2 id="services">Services</h2>

A service in Engine represents a "project" or "application". When you create a new service, we provision an API key for you that you can use to send performance metrics and schema versions to our cloud service. This information is then accessible to you through the Engine interface.

<h3 id="creating-services">Creating a service</h3>

To create a service, you will need to select an account for that service to belong to. All members of the account will be able to see the service’s data and settings options. You can transfer services between any Engine account that you’re a member of. To transfer a service, visit its Settings page and change the “Endpoint owner” to whichever account you’d like.

Services in Engine have globally unique IDs, so we recommend that you prefix your service ID with the name of your company or organization.

<h3 id="environments">Managing environments</h3>

Each service in Engine should represent a single application, and environments within your application should be tracked using [schema tags](https://www.apollographql.com/docs/platform/schema-registry.html#schema-tags). All metrics that your server reports to Engine and all schema versions that you register should be tagged with their environment, and you'll be able to filter and look at the data for individual environments within the service.

#### API keys

API keys can be added and removed from a service at any time. They are used to both send data to Engine (eg. server reporting configuration) and fetch information from Engine (eg. vs code extension configuration).

You can manage your API keys on your service's settings page. It's recommended that you use one API key per function (eg. one key per data source) to have more granular control over how your Engine data is sent and accessed.

<!--
######################################################################
Data privacy
######################################################################
-->

<h2 id="data-privacy">Data privacy</h2>

All data that is sent to Engine from your server can be configured and turned off to meet your PII/data privacy needs. This section will walk through what information Engine sees about your GraphQL service’s request, what Engine’s default behavior to handle request data is, and how you can configure Engine to the level of data privacy your team needs.

<h3 id="architecture">Architecture</h3>

Engine is primarily a cloud service that ingests and stores performance metrics data from your server. There are two ways to get data into Engine:

1. Use **Apollo Server 2** (Node servers) and configure performance metrics reporting by providing an Engine API key in your serer configuration.
2. Run the **Engine proxy** (deprecated) in front of your server and install an Apollo tracing package in your server.

#### Apollo Server 2

If you’ve set up Engine metrics forwarding using Apollo Server 2, Apollo Server will automatically start tracing the execution your requests and forwarding that information to the Engine service. Engine uses this trace data to reconstruct both operation-level timing data for given query shapes and field-level timing data for your overall schema. This data will become available for you to explore in the Engine interface.

Apollo Server will never forward the responses of your requests to Engine, but it will forward the shape of your request, the time it took each resolver to execute for that request, and the variables and headers of the request (configurable, see below).

#### Engine Proxy (deprecated)

This configuration option is primarily used to forward metrics to the Engine ingress from non-Node servers. The proxy is installed and run in your own environment on-prem as a separately hosted process that you route your client requests through. Apollo Server 1 users and other Node users users also have the option to run the Engine proxy as a sidecar next to their Node server.

As your clients make requests to your server, the proxy reads response extension data to make caching decisions and aggregates tracing and error information into reports that it sends to the Engine ingress.

While the Engine proxy sees your client request data and service response data, it only collects and forwards data that goes into the reports you see in the Engine dashboards. All information that is sent from your on-premise proxy to the out-of-band Engine cloud service is configurable and can be turned off through configuration options. Data is aggregated and sent approximately every 5 seconds.

<h3 id="data-collection">Data collection</h3>

This section describes which parts of your GraphQL HTTP requests are seen and collected by Engine.

#### Query operation string

Both Apollo Server 2 and the Engine proxy report the full operation string of your request to the Engine cloud service. Because of this, you should be careful to put any sensitive data like passwords and PII in the GraphQL variables object rather than in the operation string itself.

#### Variables

Both Apollo Server 2 and the Engine proxy will report your the query variables for each request to the Engine cloud service by default. This can be disabled in the following ways:

- **Apollo Server 2** – use the privateVariables option in your Apollo Server configuration for Engine.
- **Engine proxy** – use the privateVariables option in your proxy configuration, or prevent all variables from being reported with noTraceVariables option.

#### Authorization & Cookie HTTP Headers

Engine will **never** collect your application's `Authorization`, `Cookie`, or `Set-Cookie` headers and ignores these if received. Engine will collect all other headers from your request to show in the trace inspector, unless turned off with these configurations:

- **Apollo Server 2** – use the [`privateHeaders` option](https://www.apollographql.com/docs/apollo-server/api/apollo-server.html#EngineReportingOptions) in your Apollo Server configuration for Engine.
- **Engine Proxy** – use the [`privateHeaders` option](./proxy-config.html#Reporting) in your proxy configuration.

If you perform authorization in another header (like `X-My-API-Key`), be sure to add this to `privateHeaders` configuration. Note that unlike headers in general, this configuration option **is** case-sensitive.

<h3 id="response">Response</h3>

Let’s walk through Engine’s default behavior for reporting on fields in a typical GraphQL response:

```
// GraphQL Response
{
  "data": { ... },          // Never sent to the Engine cloud service
  "errors": [ ... ],        // Sent to Engine, used to report on errors for operations and fields.
  "extensions": {
    "tracing": { ... },     // Sent to Engine, used to report on performance data for operations and fields.
    "cacheControl": { ... } // Sent to Engine, used to determine cache policies and forward CDN cache headers.
  }
}
```

#### `response.data`

Neither Apollo Server 2 nor the Engine proxy will ever send the contents of this to the Engine cloud service. The responses from your GraphQL service stay on-prem.

If you've configured whole query caching through the Engine proxy and Engine determines that a response it sees is cacheable, then the response will be stored in your [Engine cache](./caching.html#config.stores) (either in-memory in your proxy or as an external memcached you configure).

#### `response.errors`

If either Apollo Server 2 or the Engine proxy sees a response with an `"errors"` field, they will read the `message` and `locations` fields if they exist and report them to the Engine cloud service.

You can disable reporting errors to the out-of-band Engine cloud service like so:

- **Apollo Server 2** – enable the [`maskErrorDetails` option](/docs/apollo-server/api/apollo-server#EngineReportingOptions) to remove the messages and other details from error traces sent to Apollo's cloud service.
- **Engine proxy** – use the [`noTraceErrors` option](./proxy-config.html#Reporting) to disable sending error traces to the Engine cloud service.

#### Disable Reporting (Engine proxy)

We've added the option to disable reporting of proxy stats and response traces to the Engine cloud service so that integration tests can run without polluting production data.

To disable all reporting, use the [`disabled` option](./proxy-config.html#Reporting) for the Engine proxy.

<!--
######################################################################
GDOR
######################################################################
-->

<h2 id="gdpr" title="GDPR">GDPR</h2>

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

If you have any questions (including interest in a Data Processing Addendum (DPA)), or encounter any issues, please reach out to <a href="javascript:Intercom('showNewMessage');">support</a>.

<!--
######################################################################
Policies and Agreements
######################################################################
-->

<h2 id="policies" title="Policies and Agreements">Policies and Agreements</h2>

To learn about other ways that we protect your data, please read over our [Terms of Service](https://www.apollographql.com/policies/terms) and [Privacy Policy](https://www.apollographql.com/policies/privacy).
