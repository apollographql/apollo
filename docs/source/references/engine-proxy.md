---
title: Apollo Engine proxy (deprecated)
description: Configuring and running the Engine proxy
---

## Background

The Apollo Engine proxy is a small process that can be run in front of your GraphQL server. Its primary functions are:
1. Sending **performance metrics** data from your server, which extends its responses with [`apollo-tracing`](https://github.com/apollographql/apollo-tracing) information, to the Engine cloud service.
1. Proving a **full query caching** layer, which is controlled using the [`cacheControl`](https://github.com/apollographql/apollo-cache-control) directive and configured to be either in-memory or shared through Memcache.
1. Automatically **persisting queries** through a caching layer that can map query IDs to full query strings, allowing clients to send just query IDs over the wire.

The proxy has been **deprecated since Apollo Server 2** was released. Apollo Server 2+ has [metrics reporting](https://www.apollographql.com/docs/apollo-server/features/metrics.html), [data source caching](https://www.apollographql.com/docs/apollo-server/features/data-sources.html), and [persisted queries](https://www.apollographql.com/docs/apollo-server/whats-new.html#Automatic-Persisted-Queries) as built-in features, and using it allows you to forego running the proxy. The newest features in Apollo Engine are not supported in the Engine proxy and we recommend that all Node users use Apollo Server 2+ instead running the proxy.

That said, the proxy is still a good option for getting set up with Engine in a few **specific** circumstances:
1. You are not using Apollo Server, your server has an [`apollo-tracing`](https://github.com/apollographql/apollo-tracing) plugin, and you want to get **performance metrics** insights.
1. You are relying on **full query caching** in your infrastructure.
1. You are not using Apollo Server and you want to use Apollo's **automatic persisted queries**.

## Setup

To get started with using Engine through the Engine proxy, you will need to:
1. [Install a package in your GraphQL server that adds `extension` data (in the Apollo Tracing format) to each request's response.](#Instrument-your-server)
1. [Get your Engine API key.](#Get-your-API-key)
1. [Configure and deploy the Engine proxy to run in front of your server using either Docker or npm.](#Run-the-proxy)

### Instrument your server

To get the performance metrics value out of Engine, you'll need to install a package in your server that adds the `apollo-tracing` GraphQL extension. If you want to set up response caching, you'll also need to install a package that adds the `apollo-cache-control` extension.

> **Note:** If you don't want performance metrics or caching (i.e. you're installing the Engine proxy _just_ to set up automatic persisited queries), you can skip ahead to the [next section](#Get-your-API-key).

The `apollo-tracing` and `apollo-cache-control` extensions are open specifications that can be implemented by any GraphQL server, and the following is a list of implementations:
1. **Node** with [Apollo Server](https://www.apollographql.com/docs/apollo-server/) natively supports tracing and cache control. See [Node setup instructions](./setup-node.html) for a more streamlined Node setup option.
1. **Ruby** with [GraphQL-Ruby](http://graphql-ruby.org/) supports tracing with the [apollo-tracing-ruby](https://github.com/uniiverse/apollo-tracing-ruby) gem.
1. **Java** with [GraphQL-Java](https://github.com/graphql-java/graphql-java) natively supports tracing. [Read the docs about using Apollo tracing.](https://www.graphql-java.com/documentation/master/instrumentation/)
1. **Scala** with [Sangria](https://github.com/sangria-graphql/sangria) supports tracing with [sangria-slowlog](https://github.com/sangria-graphql/sangria-slowlog#apollo-tracing-extension) project.
1. **Elixir** with [Absinthe](https://github.com/absinthe-graphql/absinthe) supports tracing with the [apollo-tracing-elixir](https://github.com/sikanhe/apollo-tracing-elixir) package.

You can test that you’ve correctly enabled Apollo Tracing by running any query against your API using GraphiQL.

The `tracing` field should now be returned as part of the response's `extensions` like below. Don’t worry, this data won’t make it back to your clients once you've set up the Engine proxy, because the proxy will filter it out.

```js line=3-5
{
  "data": { ... },
  "extensions": {
    "tracing": { ... }
  }
}
```

### Get your API key

[Log into Apollo Engine](http://engine.apollographql.com/?_ga=2.233930590.1351805406.1542648368-1704540304.1492481658) and create a service to get an API key. We’ll be using your new key in the next step.

### Run the proxy

The proxy is a small process written in Go that you host and run inside your infrastructure. It's designed to allow all of your requests and responses to pass through normally while it collects trace data, caches results, and identifies persisted queries. It's designed to handle large volumes of traffic comfortably without overloading. It does not rely on accessing the Engine cloud service to run or perform caching functions, but if it cannot talk to the Engine cloud service it will not be able to report metrics.

Apollo distributes the Engine proxy in two forms: as an **npm package** and as a **Docker container**. You can use any one of the following options for running the proxy, depending what works best for you and your team:
1. [Run the proxy with Apollo Server](#proxy-with-apollo-server)
1. [Run a standalone proxy using Node](#standalone-proxy-with-node)
1. [Run a standalone proxy using Docker](#standalone-proxy-with-docker)
1. [Run the proxy through a Platform as a Service (eg. Heroku)](#platform-as-a-service)
1. [Run the proxy in a serverless environment (eg. Lambda)](#serverless)

<h4 style="position: relative;">
<span id="proxy-with-apollo-server" style="position: absolute; top: -100px;" ></span>
Option 1: Running the proxy with Apollo Server
</h4>

The two cases where you should be running the Engine proxy with Apollo Server are:
1. You are using Apollo Server 1 and want the Apollo platform features that Engine brings.
1. You are using Apollo Server 2+ and want full query caching using the Engine proxy.

> **Note:** If you're using Apollo Server but neither of these conditions apply to you, you should be using the built-in features of Apollo Server 2+ instead of the Engine proxy.

This section assumes you're running your GraphQL server with the `express` web server package for Node, but if you're using a different framework the steps will be similar.

First, install the `apollo-engine` package from npm:

```bash
npm install --save apollo-engine
```

Then import the `ApolloEngine` constructor and create a new Engine instance. You'll need to replace `app.listen()` with `engine.listen()` like below:

```js
// Import ApolloEngine
const { ApolloEngine } = require("apollo-engine");
const { ApolloServer } = require("apollo-server-express");
const express = require("express");

// Initialize Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,

  // Make sure that tracing and cacheControl are both enabled
  tracing: true,
  cacheControl: true,

  // By setting this to "false", we avoid using Apollo Server 2's
  // integrated metric reporting and fall-back to using the Apollo
  // Engine Proxy (running separately) for metric collection.
  engine: false
});

// Initialize your Express app like usual
const app = express();

// All of your GraphQL middleware goes here
server.applyMiddleware({ app });

// Initialize engine with your API key. Alternatively,
// set the ENGINE_API_KEY environment variable when you
// run your program.
const engine = new ApolloEngine({
  apiKey: "API_KEY_HERE"
});

// Call engine.listen(...) instead of app.listen(port) as you usually would
engine.listen({
  port: 4000,
  expressApp: app
});
```

Engine is now wrapping your endpoint and processing your GraphQL requests and responses like normal. If you call your endpoint again, your requests will be routed through the Engine proxy to your server and back. If everything is working, you will no longer see  `tracing` data in your responses because your Engine proxy is filtering and processing that information for you.

<h4 style="position: relative;">
<span id="standalone-proxy-with-node" style="position: absolute; top: -100px;" ></span>
Option 2: Running a standalone proxy using Node
</h4>

Even if your GraphQL server is not implemented with Node, you may find it easier to run a tiny Node program in your hosting environment than to run a Docker container. If so, this proxy deployment option is for you.

The `apollo-engine` npm package contains an `ApolloEngineLauncher` API, which simply runs the Engine proxy with a given configuration.

First, install the `apollo-engine` package from npm:

```bash
npm install --save apollo-engine
```

Then write a small Node program that uses it, like so:

```js
const { ApolloEngineLauncher } = require('apollo-engine');

// Define the Engine configuration.
const launcher = new ApolloEngineLauncher({
  // Note: you can also provide this in the ENGINE_API_KEY environment variable.
  apiKey: 'API_KEY_HERE',
  origins: [{
    http: {
      // The URL that the proxy should use to connect to your GraphQL server.
      url: 'http://localhost:4000/api/graphql',
    },
  }],
  // Tell the proxy which ports to listen to and which paths should
  // be treated as GraphQL instead of transparently proxied as raw HTTP.
  frontends: [{
    port: 3000, // default if left out: process.env.PORT
    endpoints: ['/api/graphql'], // default if left out: /['/graphql]
  }],
});

// Start the Proxy; crash on errors.
launcher.start().catch(err => { throw err; });
```
> **Note:** Every deployment has its unique needs and we provide a variety of configuration options to fulfill them. For more configuration options, please see the [proxy config docs](./proxy-config.html). // TODO(dman): get proper link for proxy config docs

> **Note:** The argument to `new ApolloEngineLauncher()` is generally the same as the argument Node GraphQL users pass to `new ApolloEngine()`. The main differences are that you need to specify the origin's HTTP URL yourself with `new ApolloEngineLauncher()`, and the frontend `port` and `endpoints` are specified inside the constructor instead of as options to `listen()`.

If you run this program with Node, the proxy will start up and start accepting connections at http://localhost:3000. It will forward all requests to your server, which you told it is running on http://localhost:4000.

If you open up GraphiQL on http://localhost:3000, you'll notice that the `tracing` extension data is no longer in the result of your query. This is because Engine is consuming it! You can verify that everything is working correctly by checking the Engine UI for your new service and confirming that you see data in the Metrics section.

<h4 style="position: relative;">
<span id="standalone-proxy-with-docker" style="position: absolute; top: -100px;" ></span>
Option 3: Running a standalone proxy with Docker
</h4>

The Engine proxy is also distributed as a Docker image that you can deploy and manage separate from your server. It does not matter where you choose to deploy and manage your proxy, though it's more efficient if your proxy is located on the same machine or network as your GraphQL server.

The Docker container distribution of Engine proxy is configured using a JSON `engine-config.json` configuration file, like so:
```js
{
  "apiKey": "API_KEY_HERE",
  "origins": [{
    "http": {
      "url": "http://localhost:4000/api/graphql"
    }
  }],
  "frontends": [{
    "port": 3000,
    "endpoints": ["/api/graphql"]
  }]
}
```

> **Note:** Every deployment has its unique needs, and we provide a variety of configuration options to fulfill them. For example, if your origin GraphQL server is running in a virtual-hosted environment (e.g. Heroku, AWS), you may need to override the `Host` header sent to HTTP origins. For more details and instruction on configuration options, please see the [proxy config docs](./proxy-config.html). // TODO(dman): get proper proxy docs link

As it is JSON file, all object keys must be quoted, and trailing commas and comments are not allowed. Any reference in our docs to options passed to `new ApolloEngine()` otherwise translates directly into the engine config file. Like with `ApolloEngineLauncher`, you need to specify your GraphQL server's origin http URL (or other origin type like [Lambda](./setup-lambda.html)) inside the config file, and you need to specify the frontend port and GraphQL paths inside the config file rather than separately (if you're not using the default values of `process.env.PORT` and `['/graphql']`).

Next, make sure you have a working [Docker installation](https://docs.docker.com/engine/installation/) and type the following lines in your shell:

{% codeblock %}
$ ENGINE_PORT=3000
$ docker run --env "ENGINE_CONFIG=$(cat engine-config.json)" -p "${ENGINE_PORT}:${ENGINE_PORT}" gcr.io/mdg-public/engine:{% proxyDockerVersion %}
{% endcodeblock %}

> **Note:** We use [semver](https://semver.org/) to name Engine Proxy release versions, and we release version 1.2.3 under the tags `1.2.3`, `1.2`, and `1`.  If you want to pin to a precise version, use the `1.2.3` tag. If you'd like to take patch upgrades but not minor upgrades, use the `1.2` tag. If you'd like to take minor upgrades, use the `1` tag.

This will run the Engine Proxy via Docker, routing port 3000 inside the container to port 3000 outside the container. (You can also pass `--net=host` instead of the `-p 3000:3000` to just allow the Proxy direct access to your host's network.)

The Proxy should start up and accept connections at http://localhost:3000 and forward all requests to your server at http://localhost:4000. Load GraphiQL through Engine at http://localhost:3000/graphiql (or wherever you have configured your app to serve GraphiQL) and run any query. You should no longer see the `tracing` data in the result since Engine is now consuming it! Checking the Engine UI for your service, you should see data from the request you sent via GraphiQL come through in the metrics tab.

You can find the complete documentation for Engine configuration options on the [full API docs](./proxy-config.html) page, and some commonly-used fields worth knowing about are described in the [`new ApolloEngineLauncher()` docs](#api-apollo-engine-launcher).

<h4 style="position: relative;">
<span id="platform-as-a-service" style="position: absolute; top: -100px;" ></span>
Option 4: Running the proxy through a Platform as a Service (eg. Heroku)
</h4>

It may be most convenient for you to run and host the Engine proxy outside your app's deployment altogether. If that is the case, automatically running the proxy on a Platform as a Service like Heroku might be the easiest option for you.

We have an example repository with a guide for [running the Engine proxy on Heroku](https://github.com/apollographql/engine-heroku-example) that you can follow along in. Like running a [standalone proxy with Docker](#standalone-proxy-with-docker), you'll need to configure your proxy with an `engine-config.json` file like so:

```
{
  "apiKey": "<ENGINE_API_KEY>",
  "origins": [
    {
      "http": {
        "url": "http://yourappname.herokuapp.com/graphql",
        "overrideRequestHeaders": {
          "Host": "yourappname.herokuapp.com"
        }
      }
    }
  ],
  "frontends": [
    {
      "host": "0.0.0.0",
      "port": "3000",
      "graphqlPaths": ["/graphql"]
    }
  ]
}
```

> **Note:** For Virtual Hosted environments where the `PORT` is dynamically set in an environment variable named `$PORT`, you can leave out the `port` option. If your environment uses a different environment variable, you can name it with the `portFromEnv` option instead. For more details and instruction on configuration options, please see the [proxy config docs](./proxy-config.html). // TODO(dman): get proper link for proxy config docs

It does not matter where you choose to deploy and manage your Engine proxy. We've built this guide for Heroku because they have an easy deployment mechanism for Docker containers, but we run our own Engine proxy on Amazon's [EC2 Container Service](https://aws.amazon.com/ecs/).

<h4 style="position: relative;">
<span id="serverless" style="position: absolute; top: -100px;" ></span>
Option 5: Running the proxy in a serverless environment (eg. Lambda)
</h4>

Last but not least, you may be wondering how to use Engine if you run your application in a serverless environment like Lamdba. If so, this is the guide for you!

> **Note:** The best option for using Engine if you're running in a serverless environment is to use Apollo Server 2+ and its built-in reporting mechanism. Running the Engine proxy in serverless environments is tricky because the **proxy is stateful** and needs to be run separately from your cloud function.

To use Engine when running in serverless environments, we will need to configure and deploy the Engine proxy as a standalone docker container that is **separate** from your cloud function. The Engine proxy is stateful (it collects and aggregates your metrics across requests), and as such it should not be deployed with your cloud function, but separately.

The only available option for running the Engine proxy with cloud functions is to run the proxy in a standalone docker container. To do that, you can follow one of our guides here:
1. [Run a standalone proxy using Node](#standalone-proxy-with-node)
1. [Run a standalone proxy using Docker](#standalone-proxy-with-docker)
1. [Run the proxy through a Platform as a Service (eg. Heroku)](#platform-as-a-service)

The proxy needs to be run separately from your function because it's responsible for capturing, aggregating, and sending to Engine the trace data from each Lamdba instance GraphQL response.

The main difference between setting up the proxy to work with cloud functions versus setting it up with a persistent server is in how you configure it. You'll want an `engine-config.json` that looks something like this:
```
{
  "apiKey": "<ENGINE_API_KEY>",
  "origins": [
    {
      "lambda": {
          "functionArn":"arn:aws:lambda:xxxxxxxxxxx:xxxxxxxxxxxx:function:xxxxxxxxxxxxxxxxxxx",
          "awsAccessKeyId":"xxxxxxxxxxxxxxxxxxxx",
          "awsSecretAccessKey":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      }
    }
  ],
  "frontends": [
    {
      "host": "0.0.0.0",
      "port": 3001,
      "endpoints": ["/graphql"]
    }
  ]
}
```

> **Note:** This example is for AWS Lambda specifically, for which we have a special `origins` type. Other cloud functions are supported with the standard HTTP invocation, and for non-AWS cloud functions see [the standalone docs](#standalone-proxy-with-docker) for instructions on settup up the Engine proxy as a standalone API gateway to your cloud function. For full configuration details see [Proxy config] (//TODO(dman: get the proxy docs link).

The Engine proxy will invoke the Lambda function as if it was called from Amazon's [API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-set-up-simple-proxy.html#api-gateway-simple-proxy-for-lambda-input-format), and the function should return a value suitable for [API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-set-up-simple-proxy.html#api-gateway-simple-proxy-for-lambda-output-format).

If you've got a proxy running and successfully configured to talk to your cloud functions, then sending a request to it will invoke your function and return the response back to you. If everything is working, you should be able to visit the Metrics tab in the Engine UI and see data from the requests you're sending in the interface!

## Proxy configuration

View our [full proxy configuration doc](/docs/references/proxy-config.html) for information on every available configuration option for the Engine proxy.

## Release notes

View our [proxy release notes doc](/docs/references/release-notes.html) for documentation on each proxy version that's been released and a changelog of what that version contained.
