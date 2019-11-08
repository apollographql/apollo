---
title: Pushing analytics to Graph Manager
description: Understand your graph's performance with detailed metrics
---

Apollo Graph Manager can ingest operation **traces** from your GraphQL server to provide detailed performance metrics for your data graph. A trace corresponds to the execution of a single GraphQL operation, including a breakdown of the timing and error information for each field that's resolved as part of the operation.

Trace reporting enables you to visualize:

* Which operations are being executed
* Which clients are executing which operations
* Which parts of the schema are used most
* Which of your resolvers in the server are acting as bottlenecks

## Pushing analytics from Apollo Server

Apollo Server provides built-in support for pushing analytics to Graph Manager. To set it up, first obtain an API key from your graph's Settings page in the [Graph Manager UI](https://engine.apollographql.com/). Then, pass the API key to the `ApolloServer` constructor, like so:

```js{6-8}
const { ApolloServer } = require("apollo-server");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  engine: {
    apiKey: 'YOUR_API_KEY'
  }
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
```

Alternatively, you can assign your API key to the `ENGINE_API_KEY` environment variable in the environment where Apollo Server will run.

This is the only change required to begin sending traces to Graph Manager. For advanced configuration options, see [Metrics and logging](https://www.apollographql.com/docs/apollo-server/features/metrics/).

## Pushing analytics from other GraphQL servers

You can set up a reporting agent in your GraphQL server to push analytics to Apollo Graph Manager. The agent is responsible for:

* Translating operation details into the correct [trace format](#tracing-format)
* Implementing a default signature function to identify each executed operation
* Emitting batches of traces to the Graph Manager reporting endpoint
* Optionally defining plugins to enable advanced reporting features

Apollo Server defines its agent for performing these tasks in [`agent.ts`](https://github.com/apollographql/apollo-server/blob/master/packages/apollo-engine-reporting/src/agent.ts).

> If you're interested in collaborating with Apollo on creating a dedicated integration for your GraphQL server, please get in touch with us at <support@apollographql.com> or via our [Apollo Spectrum Community](https://spectrum.chat/apollo).

### Tracing format

Graph Manager's reporting endpoint accepts batches of traces that are encoded in **protocol buffer** format. Each trace corresponds to the execution of a single GraphQL operation, including a breakdown of the timing and error information for each field that's resolved as part of the operation.

The schema for this protocol buffer is defined as the `FullTracesReport` message in the [TypeScript reference implementation](https://github.com/apollographql/apollo-server/blob/master/packages/apollo-engine-reporting-protobuf/src/reports.proto#L466). 

As a starting point, we recommend implementing an extension to the GraphQL execution that creates a report with a single trace, as defined in the `Trace` message of [the protobuf schema](https://github.com/apollographql/apollo-server/blob/master/packages/apollo-engine-reporting-protobuf/src/reports.proto#L7). Then, you can batch multiple traces into a single report. We recommend sending batches every 5 to 10 seconds, and limiting each batch to a reasonable size (~4MB).

An example of a `FullTracesReport` message, represented as JSON, is provided [below](#example-fulltracesreport-message).

> Many server runtimes already support emitting tracing information as a [GraphQL extension](https://github.com/apollographql/apollo-tracing). Such extensions are available for [Node](https://github.com/apollographql/apollo-server/blob/master/packages/apollo-engine-reporting/src/extension.ts), [Ruby](https://github.com/uniiverse/apollo-tracing-ruby), [Scala](https://github.com/sangria-graphql/sangria-slowlog#apollo-tracing-extension), [Java](https://github.com/graphql-java/graphql-java/pull/577), [Elixir](https://github.com/sikanhe/apollo-tracing-elixir), and [.NET](https://graphql-dotnet.github.io/docs/getting-started/metrics/). If you're working on adding metrics reporting functionality for one of these languages, reading through that tracing instrumentation is a good place to start. For other languages, we recommend consulting the [Apollo Server instrumentation](https://github.com/apollographql/apollo-server/blob/master/packages/apollo-engine-reporting/src/extension.ts).

### Operation signing

For Graph Manager to correctly group GraphQL queries, your reporting agent should define a function to generate a  **query signature** for each distinct query. This can be challenging, because two _structurally_ different queries can be _functionally_ equivalent. For instance, all of the following queries request the same information:

```graphql
query AuthorForPost($foo: String!) {
  post(id: $foo) {
    author
  }
}

query AuthorForPost($bar: String!) {
  post(id: $bar) {
    author
  }
}

query AuthorForPost {
  post(id: "my-post-id") {
    author
  }
}

query AuthorForPost {
  post(id: "my-post-id") {
    writer: author
  }
}
```

It's important to decide how to group such queries when tracking metrics. The [TypeScript reference implementation](https://github.com/apollographql/apollo-server/blob/master/packages/apollo-engine-reporting/src/signature.ts) does the following to every query before generating its signature to better group functionally equivalent operations:

* Drop unused fragments and/or operations
* Hide string literals
* Ignore aliases
* Sort the tree deterministically
* Ignore differences in whitespace.

We recommend using the same default signature method for consistency across different server runtimes.

### Sending metrics to the reporting endpoint

After your GraphQL server prepares a batch of traces, it should send them to the Graph Manager reporting endpoint, at the following URL:

```
https://engine-report.apollodata.com/api/ingress/traces
```

Each batch should be sent as an HTTP POST request. The body of the request can be one of the following:

* A binary serialization of a `FullTracesReport` message
* A _Gzipped_ binary serialization of a `FullTracesReport` message

To authenticate with Graph Manager, each request must include either:

* An `X-Api-Key` header with a valid API key for your graph
* An `authtoken` cookie with a valid API key for your graph

The request can also optionally include a `Content-Type` header with value `application/protobuf`, but this is not required.

For a reference implementation, see the `sendReport()` method in the [TypeScript reference agent](https://github.com/apollographql/apollo-server/blob/master/packages/apollo-engine-reporting/src/agent.ts#L210).

#### Tuning reporting behavior

We recommend implementing retries with backoff when you encounter `5xx` responses or networking errors when communicating with the reporting endpoint. Additionally, implement a shutdown hook to make sure you push all pending reports before your server initiates a healthy shutdown.

### Implementing additional reporting features

The reference TypeScript implementation includes several features that you might want to include in your implementation. All of these features are implemented in the agent itself, and are documented in the interface description for the `EngineReportingOptions` of [the agent](https://github.com/apollographql/apollo-server/blob/master/packages/apollo-engine-reporting/src/agent.ts#L48).

For example, the option to send reports immediately is particularly useful for GraphQL servers that run in a serverless environment, like AWS Lambda or Google Cloud Functions.

Another important feature is the ability to restrict which information is sent to Graph Manager, particularly to avoid reporting personal data. Because personal data most commonly appears in variables and headers, the TypeScript agent offers options for `privateVariables` and `privateHeaders`.

### Example `FullTracesReport` message

The `FullTracesReport` message must be provided to the Graph Manager reporting endpoint in protocol buffer format, as described in [Tracing format](#tracing-format). This example is shown in JSON format to illustrate the structure of the message.

```json
{
  "header": {
    "hostname": "www.example.com",
    "schemaTag": "staging",
    "schemaHash": "alskncka384u1923e8uino1289jncvo019n"
  },
  "tracesPerQuery": {
    "# Foo\nquery Foo { user { email pets { name } } }": {
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
            "child": [
              {
                "response_name": "user",
                "type": "User",
                "start_time": "16450765",
                "end_time": "750079190",
                "child": [
                  {
                    "response_name": "email",
                    "type": "String",
                    "start_time": "750122948",
                    "end_time": "750145101",
                    "parent_type": "User"
                  }
                ],
                "parent_type": "Query"
              }
            ]
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
          "clientReferenceId": "c2_id",
          "root": {
            "child": [
              {
                "response_name": "user",
                "type": "User",
                "start_time": "16450962",
                "end_time": "750079190",
                "child": [
                  {
                    "response_name": "email",
                    "type": "String",
                    "start_time": "720132958",
                    "end_time": "720145167",
                    "parent_type": "User"
                  },
                  {
                    "response_name": "pets",
                    "type": "[Pet]",
                    "start_time": "720132959",
                    "end_time": "720135177",
                    "parent_type": "User",
                    "child": [
                      {
                        "index": 0,
                        "child": [
                          {
                            "response_name": "name",
                            "type": "String",
                            "start_time": "720133006",
                            "end_time": "720133039",
                            "parent_type": "Pet"
                          }
                        ]
                      },
                      {
                        "index": 1,
                        "child": [
                          {
                            "response_name": "name",
                            "type": "String",
                            "start_time": "720133041",
                            "end_time": "720133102",
                            "parent_type": "Pet"
                          }
                        ]
                      }
                    ]
                  }
                ],
                "parent_type": "Query"
              }
            ]
          }
        }
      ]
    }
  }
}
```
