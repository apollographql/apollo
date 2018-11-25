---
title: Turn on analytics
description: Turn on metrics reporting to get performance and schema usage insights
---

GraphQL offers a number of interesting insights in the realm of server performance and usage monitoring. Because the structure of GraphQL queries requires clients to request exactly the fields they need, simple instrumentation allows us to elicit exactly which fields in the schema are being used at any given time. This helps us understand how much usage different parts of our data model get at a far more granular level than we could achieve out of the box with non-GraphQL APIs.

<h4>Tracing query execution</h4>

A "trace" corresponds to exactly one [GraphQL operation](https://www.apollographql.com/docs/resources/graphql-glossary.html#operation) and represents a breakdown of timing and error information for each individual field resolved as part of that operation.

By recording which resolvers executed in our server and their traces, we can build a rich dataset. From it, we see exactly which query shapes are being run, who is sending them, which parts of the schema are most utilized, which resolvers in the server are bottlenecks, etc.

We've specifically built an interface to view this information into [Apollo Engine](https://engine.apollographql.com/) and any GraphQL server can report metrics to Engine by sending data in the `apollo-tracing` format to our metrics ingress. Read on to learn how to set this up in your environment.

<h2 id="apollo-server">Apollo Server</h2>

Apollo Server has had the ability to report its performance usage metrics to Engine as a built-in option since `2.0`. To set it up, get an API key from the Engine interface [here](https://engine.apollographql.com/) and use it as the value for the `ENGINE_API_KEY` environment variable. You can also pass it to the Apollo Server constructor like so:

```js line=6-8
const { ApolloServer } = require("apollo-server");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  engine: {
    apiKey: "YOUR API KEY HERE"
  }
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
```

For advanced Apollo Server configuration options to set up logging and client-aware metrics reporting take a look at our server documentation [here](https://www.apollographql.com/docs/apollo-server/features/metrics.html).

#### Configuring metrics reporting with Apollo Server pre-`2.0`

To configure metrics reporting with versions of Apollo Server pre-`2.0` you'll need to use the [`apollo-engine` npm package](https://www.npmjs.com/package/apollo-engine), which is a wrapper that runs our deprecated [Engine proxy] (//TODO(dman): get link). **We highly recommend that you upgrade to Apollo Server 2** and use the built-in integration instead of using this option because Engine's newer features are not supported in the Engine proxy.

To set up your server with the Engine proxy using the `apollo-engine` npm package take a look at our guide [here] (//TODO(dman): get link).

<h2 id="other-servers">Other servers</h2>

There are 2 ways to send metrics data from your server to Engine:
1. Report traces directly from your server to our reporting endpoint
2. Use an Apollo tracing package and the Engine proxy (deprecated)

### Engine reporting endpoint

We recommend following the agent pattern to report trace metrics from your server to the Engine reporting endpoint. This is what Apollo Server does internally and the code for the Apollo Server reference agent is [here](https://github.com/apollographql/apollo-server/blob/3d6912434051ae7038153ef39e32f485a35609f0/packages/apollo-engine-reporting/src/agent.ts).

We've been working with our community to build agent integrations for non-JavaScript servers. If you're interested in collaborating with us on an integration for your server, please get in touch with us at support@apollographql.com or via the #engine channel on the [Apollo Community Slack](https://apollographql.com/slack). We'd love to help support you in any way we can!

To create a new reporting agent, you'll want to satisfy a few separate concerns:

1. Translating execution information into the correct Tracing format
2. Implementing a default signature function to identify operations
3. Emitting batches of Traces to the reporting endpoint
4. Providing plugins for more advanced reporting functionality

<h4 id="tracing-format">1. Tracing Format</h4>

The first step of creating a metrics reporting agent will be to hook into the GraphQL execution pipeline to create the metrics and translate them into the proper data format.

The reporting endpoint accepts a batch of "traces" encoded as protobuf. Each individual trace represents execution of a single operation, specifically timing and error information of that execution, broken down by field. Each trace also contains context that is operation-specific (e.g. which client an operation was sent from, if the response was fetched from the cache). In addition to the batch of trace details, the metrics report also includes the context within which all operations were executed (e.g. staging vs prod) in a report header.

As mentioned, this batch of traces and context is encoded via protobuf. The schema for the protobuf message is defined as the `FullTracesReport` message in the TypeScript reference implementation [here](https://github.com/apollographql/apollo-server/blob/master/packages/apollo-engine-reporting-protobuf/reports.proto#L380). The reporting agent is **not** responsible for aggregating this list of individual traces and filtering out certain traces to persist. That process is handled via Apollo's cloud services.

As a good starting point, we recommend implementing an extension to the GraphQL execution that creates a report with one trace, as defined in the `Trace` message of [the protobuf schema](https://github.com/apollographql/apollo-server/blob/master/packages/apollo-engine-reporting-protobuf/reports.proto#L9). The next step will be to batch multiple traces into a single report, which we recommend batches of 5-10 seconds while limiting reports to a reasonable size (~4MB).

>Many server runtimes already have support for emitting tracing information as a [GraphQL extension](https://github.com/apollographql/apollo-tracing), which involves hooking into the request pipeline and capturing timing and error data about each resolver's execution. These implmentations include runtimes in [Node](https://github.com/apollographql/apollo-server/blob/master/packages/apollo-engine-reporting/src/extension.ts), [Ruby](https://github.com/uniiverse/apollo-tracing-ruby), [Scala](https://github.com/sangria-graphql/sangria-slowlog#apollo-tracing-extension), [Java](https://github.com/graphql-java/graphql-java/pull/577), [Elixir](https://github.com/sikanhe/apollo-tracing-elixir), and [.NET](https://graphql-dotnet.github.io/docs/getting-started/metrics/). If you're working on adding metrics reporting functionality for one of _these languages_, reading through that tracing instrumentation is a good place to start and to plug into. For _other languages_, we recommend reading through the Apollo Server instrumentation [here](https://github.com/apollographql/apollo-server/blob/master/packages/apollo-engine-reporting/src/extension.ts) as reference.

An example of a FullTracesReport message, represented as JSON, can be found below*

<h4 id="query-signature">2. Operation Signing</h4>

In order to correctly group GraphQL operations, it's important to define a method for "signing" a query. Compare the following queries:

```gql
(1)
query AuthorForPost($foo: String!) {
  post(id: $foo) {
    author
  }
}

(2)
query AuthorForPost($bar: String!) {
  post(id: $bar) {
    author
  }
}

(3)
query AuthorForPost($foo: String!) { post(id: $foo) { author }}

(4)
query AuthorForPost { post(id: "my-post-id") { author }}

(5)
query AuthorForPost { post(id: "my-post-id") { writer: author }}
```

Which of these should be grouped together? Why? As you can see, there's not always an obvious answer for identifying if two distinct queries should represent the same thing. The concept of a "query signature" is what is used to group similar operations together even if their exact textual representations are not identical. The query signature, along with the operation name, are used to group queries together in the `FullTracesReport`.

The TypeScript reference implementation uses a default signature method and allows for that signature method to also be overridden by the user. The [implementation of the default](https://github.com/apollographql/apollo-server/blob/master/packages/apollo-engine-reporting/src/signature.ts) drops unused fragments and/or operations, hides String literals, ignores aliases, sorts the tree deterministically, and ignores whitespace differences. We recommend using the same default signature method for consistency across different server runtimes.

<h4 id="sending-metrics">3. Sending Metrics</h4>

Once a metrics report (i.e. batch of traces) is prepared, it will need to be sent to an ingress for aggregation and sampling. Currently, this is all performed in Apollo's cloud services. The endpoint for this aggregation and sampling is at `https://engine-report.apollodata.com/api/ingress/traces`, which supports the protobuf format mentioned above via a `POST` request. The reporting endpoint accepts a gzipped body as well. To see the full reference implementation, see the `sendReport()` method in the [TypeScript reference agent](https://github.com/apollographql/apollo-server/blob/master/packages/apollo-engine-reporting/src/agent.ts#L210).

Reporting agents can authenticate either via the `X-Api-Key` header or the `authtoken` cookie with the service API key.

We recommend implementing retries with backoff on 5xx responses and network errors and allowing for the batching size to be tunable by the user. Additionally, we recommend adding a shutdown hook to send all pending reports to ensure that healthy server shutdowns do not result in missing data, as this tracing information is especially important.

>NOTE: In the future, we plan to release a local aggregation and sampling agent that could be used to lessen the bandwidth requirements on reporting agents.

<h4 id="advanced-features">4. [Optional] Advanced Reporting Features</h4>

The reference TypeScript implementation also includes several more advanced features which may be worth porting to new implementations. All of these features are implemented in the agent itself and are documented in the interface description for the EngineReportingOptions of [the agent](https://github.com/apollographql/apollo-server/blob/master/packages/apollo-engine-reporting/src/agent.ts#L51).

For example, the option to send reports immediately may be particularly useful to GraphQL servers running in a serverless environment, like AWS Lambda or Google Cloud Functions.

Another important feature is the ability to limit information sent, particularly to avoid reporting [PII](https://en.wikipedia.org/wiki/Personally_identifiable_information). Because the most common place for PII to appear is in variables and headers, the TypeScript agent offers options for `privateVariables` and `privateHeaders`.

<h4 id="traces-report-example">Example FullTracesReport, represented as JSON</h4>
```json
{
  "header": {
    "hostname": "www.example.com",
    "schemaTag": "staging",
    "schemaHash": "alskncka384u1923e8uino1289jncvo019n"
  },
  "tracesPerQuery": {
    "# Foo\nquery Foo { user { email } }": {
      "trace": [
        {
          "endTime": "2018-11-25T18:28:36.604Z",
          "startTime": "2018-11-25T18:28:36.104Z",
          "clientName": "c1",
          "clientVersion": "v1",
          "http": {
            "method": "POST"
          },
          "durationNs": "2498055950907169",
          "root": {
            "fieldName": "user",
            "type": "User!",
            "startTime": "1",
            "endTime": "10",
            "child": [
              {
                "fieldName": "email",
                "type": "String!",
                "startTime": "11",
                "endTime": "12",
                "parentType": "User"
              }
            ],
            "parentType": "Query"
          }
        },
        {
          "endTime": "2018-11-25T18:28:37.004Z",
          "startTime": "2018-11-25T18:28:36.404Z",
          "clientName": "c2",
          "clientVersion": "v1",
          "http": {
            "method": "POST"
          },
          "durationNs": "13154220",
          "root": {
            "fieldName": "user",
            "type": "User!",
            "startTime": "1",
            "endTime": "10",
            "child": [
              {
                "fieldName": "email",
                "type": "String!",
                "startTime": "13",
                "endTime": "15",
                "parentType": "User"
              }
            ],
            "parentType": "Query"
          },
          "clientReferenceId": "c2_id"
        }
      ]
    }
  }
}
```

### Engine proxy (deprecated)

The Engine proxy is our legacy option for sending trace metrics from your server to the Engine reporting endpoint. It's a small binary Go process that runs in front of your server and collects trace extension data from your server's responses.

You first install an [`apollo-tracing`](https://github.com/apollographql/apollo-tracing) package in your server, which augments your server's responses with an `extensions` field that contains the request's trace timings. The Engine proxy, which is running in front of your server, will strip the `extensions` from your response, send the regular `data` response on to your clients, and send the request trace timings to Engine.

To view detailed information on how to set up the Engine proxy for non-JavaScript servers see our detailed guide [here] (//TODO(dman): find the link).
