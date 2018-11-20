---
title: Turn on analytics
description: Turn on metrics reporting to get performance and schema usage insights
---

GraphQL offers a number of interesting insights in the realm of server performance and usage monitoring. Because the structure of GraphQL queries requires clients to request exactly the fields they need, simple instrumentation allows us to elicit exactly which fields in the schema are being used at any given time. This helps us understand how much usage different parts of our data model get at a far more granular level than we could achieve out of the box with non-GraphQL APIs.

<h4>Tracing query execution</h4>

By recording which resolvers executed in our server and the times that they started and finished execution, we can build a rich dataset. From it, we see exactly which query shapes are being run, who is sending them, which parts of the schema are most utilized, which resolvers in the server are bottlenecks, etc.

We've specifically built an interface to view this information into [Apollo Engine](https://engine.apollographql.com/) and any GraphQL server can report metrics to Engine by sending data in the `apollo-tracing` format to our metrics ingress. Read on to learn how to set this up in your environment.

<h2 id="apollo-server">Apollo Server</h2>

Apollo Server has had the ability to report its performance usage metrics to Engine as a built-in option since `2.0`. To set it up, get an API key from the Engine interface [here](https://engine.apollographql.com/) and pass it to the Apollo Server constructor like so:

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

We recommend following the agent pattern to report trace metrics from your server to the Engine reporting endpoint. This is what Apollo Server does internally and the code for the Apollo Server agent is [here](https://github.com/apollographql/apollo-server/blob/3d6912434051ae7038153ef39e32f485a35609f0/packages/apollo-engine-reporting/src/agent.ts).

// TODO(dman): follow up with Adam on the documentation for the AER endpoint

We've been working with our community to build agent integrations for non-JavaScript servers. If you're interested in collaborating with us on an integration for your server, please get in touch with us at support@apollographql.com.

### Engine proxy (deprecated)

The Engine proxy is our legacy option for sending trace metrics from your server to the Engine reporting endpoint. It's a small binary Go process that runs in front of your server and collects trace extension data from your server's responses.

You first install an [`apollo-tracing`](https://github.com/apollographql/apollo-tracing) package in your server, which augments your server's responses with an `extensions` field that contains the request's trace timings. The Engine proxy, which is running in front of your server, will strip the `extensions` from your response, send the regular `data` response on to your clients, and send the request trace timings to Engine.

To view detailed information on how to set up the Engine proxy for non-JavaScript servers see our detailed guide [here] (//TODO(dman): find the link).
