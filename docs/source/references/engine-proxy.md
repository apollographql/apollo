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

The versions given here are both for the [`apollo-engine` Node.js package](https://www.npmjs.com/package/apollo-engine) and the `gcr.io/mdg-public/engine` Docker container.

<h3 id="v1.1.2" title="v1.1.2">1.1.2 - 2018-06-08</h3>

* Fixes bug involving the X-Forwarded-For header not being set.
* Simplified API for users of the `pipePath` argument in `engine.listen(...)` with the apollo-engine `npm` package. Now, rather than needing to explicitly specify the `pipePath` argument in the call, an string argument to `port` that begins with `\\.\pipe\` will result in listening on the specified named pipe. Thus, calls such as `engine.listen({pipePath: "\\.\pipe\bar", httpServer: foo})` can be replaced by `engine.listen({port: "\\.\pipe\bar", httpServer: foo})`, which should help users developing locally using TCP and deploying to servers using IISNode, such as Microsoft Azure.

<h3 id="v1.1.1" title="v1.1.1">1.1.1 - 2018-05-07</h3>

* The Engine Proxy now sanitizes invalid UTF-8 in HTTP headers and variables, fixing the error `Error reporting traces. error="POST https://engine-report.apollodata.com/api/ss/traces giving up after 6 attempts"`
* You may now use Engine with named pipes on Windows machines to support Node server deployments to Microsoft Azure. Instead of using the `port` argument in `engine.listen({port: process.env.PORT, httpServer: foo})`, you can now specify the `pipePath` argument to listen on a named pipe such as `engine.listen({pipePath: "\\.\pipe\bar", httpServer: foo})`. In Microsoft Azure, `process.env.PORT` is an acceptable input to `pipePath`.
* The Engine Proxy now differentiates request timeouts from failed requests. This will remove the “Unable to communicate with backend” error and replace it with two errors: one for no response or refused connection, and one for request timeouts.
* The Engine Proxy now sets the `X-Forwarded-For` header and does string appending to other `X-Forwarded-` headers if they are already set.

<h3 id="v1.1.0" title="v1.1.0">1.1.0 - 2018-04-10</h3>

Because this is a minor release, if you are using Engine via the Docker container and have specified the `1.0` tag, you'll need to change to the `1.1` tag to upgrade to this release.

* The Engine Proxy now supports serving HTTPS over TLS, including HTTP/2.
* You may now set your API key with the environment variable `ENGINE_API_KEY` in addition to with the `apiKey` configuration option.
* The Engine Proxy now sets the `X-Apollo-Engine` header on requests it proxies so that your origin GraphQL server can tell if it is running behind Engine. (This is primarily intended to improve diagnostics if Engine is misconfigured.)


<h3 id="v1.0.6" title="v1.0.6">1.0.6 - 2018-04-06</h3>

* New `reporting.noTraceErrors` option to disable sending error traces to Apollo servers. Use this if your error messages may contain [PII](https://en.wikipedia.org/wiki/Personally_identifiable_information). If you are interested in a more fine-grained way to configure this, contact <a href="javascript:void(0);" onclick="Intercom('showNewMessage')">Apollo support</a>.
* Fix problems running `ApolloEngine` when a corporate HTTP proxy is configured with an environment variable such as `$HTTP_PROXY`. (Specifically, make the default [`innerHost` option to `engine.listen`](../setup-node.html#api-engine.listen) actually be `127.0.0.1` as documented rather than the unspecified interface; the previously implemented default was unintentional as well as the cause of the corporate proxy bug.)

<h3 id="v1.0.5" title="v1.0.5">1.0.5 - 2018-04-05</h3>

This release include a variety of changes related to caching.

* The Engine Proxy now observes the `Vary` header in HTTP responses. See the new [documentation of cache header support](../proxy/guides.html#caching) for more details.
* The Engine Proxy now explicitly requests that "persisted query not found" responses are not cached by CDNs or browsers. (Typically these responses are followed by the client informing Engine of the full matching query, so caching the not-found response was effectively cache poisoning.)
* The Engine Proxy now includes `Cache-Control` headers on responses served from its cache, not just on responses it stores to its cache.
* The Engine Proxy no longer uses a generic HTTP heuristic to generate a max age limit for responses with the HTTP header `Last-Modified` but no other HTTP-level max age specification. This was added accidentally in v1.0.4 and is not necessary given that we only cache data that explicitly requests it in the GraphQL extension.
* The Engine Proxy now properly comma-separates fields in generated `Cache-Control` response headers.
* The warning when trying to insert an oversized item into an in-memory cache is now more explicit about the size limit. (Items in the in-memory cache cannot be larger than approximately 1/1024 of the total cache size.)

<h3 id="v1.0.4" title="v1.0.4">1.0.4 - 2018-03-23</h3>

* The Engine Proxy now will compress responses to GraphQL queries by default if the client sends the standard HTTP `Accept-Encoding: gzip` header. You can disable this by passing `frontends: [{responseCompression: {disabled: true}}]` to the `ApolloEngine` constructor. (The Engine Proxy continues to accept compressed responses from your GraphQL origin by default as well.) Engine will never proactively compress responses to requests on non-GraphQL paths but will pass through any compression applied by the server it is proxying to.
* The Engine Proxy has better support for HTTP caching headers:
    * The Engine Proxy has a better parser for `Cache-Control` and similar headers sent by your GraphQL origin, which it can use to constrain the response's cache policy further than what the GraphQL `cacheControl` extension dictates. We still recommend that Engine users use the `cacheControl` GraphQL extension (if supported by your GraphQL server library) rather than HTTP caching headers so that your GraphQL server will be ready for partial query caching.
    * The Engine Proxy now sets the `Cache-Control` header on cacheable GraphQL responses.
    * The Engine Proxy now sets the `Age` header when serving responses from the query response cache.
    * The Engine Proxy now respects the `Cache-Control: no-cache` HTTP header in client requests.
* The Engine Proxy has more detailed logging about caching decisions when `logging.level` is set to `DEBUG`.
* The Engine Proxy binary properly shuts down on the `SIGUSR2` signal (which is sent by the `nodemon` utility).
* More details about GraphQL errors are included in traces sent to the Engine Service.
* The `apollo-engine` npm package now includes all the dependencies needed to be included in a TypeScript project.

<h3 id="v1.0.3" title="v1.0.3">1.0.3 - 2018-03-19</h3>

This version only has JS changes: the Docker container release is identical to 1.0.2.

* `engine.listen()` and `launcher.start()` now register handlers for the `exit`, `uncaughtException`, `SIGINT`, `SIGTERM`, and `SIGUSR2` [events on `process`](https://nodejs.org/api/process.html#process_process_events) to kill the Engine Proxy process. You can customize the list of events with the new `processCleanupEvents` option.

<h3 id="v1.0.2" title="v1.0.2">1.0.2 - 2018-03-14</h3>

* Add `overrideGraphqlResponseHeaders` frontend configuration option. This option lets you set HTTP headers to be sent with all GraphQL HTTP responses. For now, this is required to avoid CORS errors if you use [persisted queries](./auto-persisted-queries.html) from clients from a different origin from your GraphQL (Engine) frontend.
* Fix bug where certain malformed GraphQL requests were reported to Engine as having taken multiple millennia.
* Improve support for `application/graphql` requests. We still recommend sending your requests as JSON, which is supported by more servers and supports variables, operation name, and client-to-server extension, but we now deal better with `application/graphql` requests if you send them.
* Improve error handling when your GraphQL origin sends Engine an unsupported Content-Type.

<h3 id="v1.0.1" title="v1.0.1">1.0.1 - 2018-03-07</h3>

v1 of `apollo-engine` has a redesigned streamlined Node API called `ApolloEngine`. See [the 1.0 migration guide](./1.0-migration.html) for details on how to upgrade.  In addition to a simplified API and higher performance, the new API adds support for the Restify and Hapi v16 web frameworks, and it is easy to integrate with any Node web framework that works with `http.Server`.

If you aren't integrating with a Node GraphQL server but still find Node programs easier to run than Docker Containers, the `apollo-engine` npm module has a new API called `ApolloEngineLauncher` that allows you to run the Engine Proxy with arbitrary configuration without hooking into a Node GraphQL server.

Features that used to depend on a caching store definition now are on by default, sharing a 50MB in-memory cache. Specifically:
* The public full-query response cache is enabled by default. Only responses annotated with the `cache-control` extension are cached.
* The private full-query response cache is enabled by default if `sessionAuth` is configured. Only responses annotated with the `cache-control` extension are cached.
* Automatic persisted queries are on by default.
* If `sessionAuth` is configured with a `tokenAuthUrl`, verifications are cacheed by default.
If you don't like these defaults, you can set each store name field to `"disabled"` to turn off the relevant feature. If you want to change the default cache size in bytes, add `stores: [{inMemory: {cacheSize: 123456}}]` to your Engine config (ie, the argument to `new ApolloEngine()`). If you want to change the default cache to memcached, add `stores: [{memcache: {url: ["localhost:1234"]}}]` to your Engine config.

Starting with v1, the Docker container releases use the same version numbers as the `apollo-engine` npm releases. The following changes are mostly relevant to users of the Docker container:
* It's valid to specify zero frontends. Engine Proxy will default to one with all default values.
* The deprecated `endpoint` field is removed from `frontends` configuration. Put your endpoint (GraphQL URL path) in a list in `endpoints` instead, or continue to let `apollo-engine` set it for you.
* The `endpoints` field on frontends now defaults to `["/graphql"]` instead of being required.
* The header secret feature (required so that double proxying middleware could tell if it's seeing the request for the first or second time) is removed. This was intended only for internal use by `apollo-engine`.
* If you configure a frontend endpoint as `/graphql`, requests to `/graphql/` should be served also. (The `apollo-engine` `Engine` wrapper previously implemented this; now it is implemented natively inside the Engine Proxy.)
* A bug that could lead to the warning `Encountered trace without end time. This is a bug in Engine proxy.` has been fixed.


(v1.0.0 was a mistakenly published empty package from the beginning of apollo-engine's development. Do not use v1.0.0 --- go directly to v1.0.1!)

<h3 id="older-versions">Older versions</h3>

**0.9.1 - 2018-03-01**

* The `prettier` package was accidentally added as a dependency rather than a dev-only dependency in 0.9.0. It is now in devDependencies.

**0.9.0 - 2018-03-01**

* Simplify how the apollo-engine npm module communicates with the Engine Proxy binary.  **Backwards-incompatible changes**:
  - The `logger` option to `new Engine` added in 0.8.9 no longer exists. It is replaced by `proxyStdoutStream` and `proxyStderrStream` options, as well as a `restarting` event on the `Engine` object.
  - The default log style is now the same as in the Docker container release of Engine Proxy: textual logs over stdout, instead of JSON over stderr.
* Unknown fields in the Engine config file (or `engineConfig` option to `new Engine`) and unknown options passed to `new Engine` now result in an error.
* Added support for receiving client-provided GraphQL extensions such as `persistedQuery` over GET requests. To use GET requests (with or without persisted queries), we recommend you upgrade to [`apollo-link-http` 1.5.0](https://www.npmjs.com/package/apollo-link-http) and pass `useGETForQueries: true` to `createHttpLink` in your client code.
* Add support for proxying non-GraphQL requests with Lambda origins. This allows serving GraphiQL directly from a Lambda handler.
No additional configuration is required to start using this feature.
* Added the ability to define the frontend port (the port Engine proxy will listen on) from an environment variable.
  To define the frontend port via the environment, remove `"port": 1234,` from the frontend configuration, and add `"portFromEnv": "MY_PORT_VARIABLE"`.
  This will cause the proxy to read the `MY_PORT_VARIABLE` environment variable.
  Heroku users in particular should set `"portFromEnv": "PORT"`.
* Improve error messages for GraphQL request parse failures and for several common configuration problems.
* Bugfix to automatic config reloading.

**0.8.10 - 2018-02-12**

* Added support for GZIP content encoding for responses from Lambda origins.
* Added support for function qualifiers for Lambda origins.
* Allows per-endpoint origin specification on frontends via `endpointMap`, a &lt;string,string&gt; map from endpoint path to `originName`. Users can use this field instead of `endpoints` and `originName` to route different URL paths on a frontend to serve different origins. If `endpointMap` is set, the Proxy will return a 404 error to HTTP requests sent to paths that don't match one of its keys. The proxy will also verify that only one of `endpoint` [deprecated], `endpoints`, and `endpointMap` are set.
	* For example, if you have two origins with names `[adminOrigin, userOrigin]` and want to forward requests to `/admin` and `/user` respectively, on the `Frontend` config, specify `"endpointMap": {"/admin":"adminOrigin", "/user":"userOrigin"}` and do not specify `endpoint` or `endpoints`.
* Fixed a bug where all custom extensions were assumed to be maps.


**0.8.9 - 2018-02-06**

* Fixed a bug where `Host` header was still not forwarded to origin servers if present.
* Exposed stats field to better track Engine proxy memory usage.
* Properly forward the Host header to the Engine Proxy.
* New `logger` option to override some aspects of logging in apollo-engine. (Removed in 0.9.0.)
* Do not override http origin url if set.
* Allow endpoint to end with '/' or '\'.


<a name="v2018.01-54-gce490265c"></a>
**2018.01-54-gce490265c - 2018-01-31**

* Fixed a bug where the `Host` header was not forwarded to origin servers. If the `Host` header is present, it will also be sent in the `X-Forwarded-Host` header. Both of these header values can be overridden via the field mentioned below.
* Added the ability for users to override which headers are sent to their GraphQL origin. Users can do this by specifying the `overrideRequestHeaders` field in `origin.http` in the Engine config object. By default Engine will forward all header values it receives to the origin server. This field is only for users that want to override the default behavior.
  * For example, to override the `Host` header which may need to be done when deploying Engine inside of a PaaS (such as Heroku) follow instructions [here](../setup-virtual.html).

**2018.01-43-g1747440e6 - 2018-01-29**
<a name="v2018.01-43-g1747440e6"></a>

* Fixed an issue where Engine proxy would cache responses that set a cookie, causing cache hits to set the same cookie.
  Engine proxy now skips cache for:
    * Responses with a `Set-Cookie` header.
    * Responses with a `WWW-Authenticate` header.
    * Responses with a `Cache-Control` header value of: `no-cache` ,`no-store` or `private`.
    * Responses with an `Expires` header of `0`, or any date in the past.
* Fixed several issues with timestamps included in reports sent to engine backend.
* Added the ability to dump stacktraces of all running threads when Engine proxy receives a `SIGUSR2` signal.
  When requested, traces are dumped to stderr. This should not be necessary unless requested by Apollo support.
* Added the ability to collect performance data from Engine proxy using [Go pprof profiler](https://golang.org/pkg/net/http/pprof/).
  To enable the pprof server, add `"debugServer": {"port": 1234}` to your engine configuration.
  Note that the pprof server offers no security, so a firewall etc is required if running in production.
  Enabling the debug server should not be necessary unless requested by Apollo support.

**2018.01-17-g9c203510f - 2018-01-16**
<a name="v2018.01-17-g9c203510f"></a>

* Fixed an issue where a data race could cause the proxy to crash.

**2018.01-1-gc024df504 - 2018-01-04**
<a name="v2018.01-1-gc024df504"></a>

* Added a flag to disable certificate validation when communicating with HTTPS origins.
  To disable certificate validation, set `disableCertificateCheck: true` within the `http` section of the origin's configuration.
  This is strongly discouraged, as it leaves Engine vulnerable to man-in-the-middle attacks. It is intended for testing only.

* Added a flag to use custom certificate authorities when communicating with HTTPS origins.
  To use custom certificate authorities, set: `trustedCertificates: /etc/ssl/cert.pem` (or another file path) within the `http` section of the origin's configuration.
  CA certificates must be PEM encoded. Multiple certificates can be included in the same file.

**2017.12-45-g12ba029f9 - 2017-12-20**
<a name="v2017.12-45-g12ba029f9"></a>

* Added support for multiple endpoints per origin through a new `endpoints` setting, deprecated the previous `endpoint` setting.
* Added a health check URL at `/.well-known/apollo/engine-health`, currently returning HTTP status 200 unconditionally.
* Fixed an issue where reports would always be sent on shut down, even when reporting was disabled.
* Fixed issues with reloading of `frontend`s, and dependencies like logging and caches.

**2017.12-28-gcc16cbea7 - 2017-12-12**
<a name="v2017.12-28-gcc16cbea7"></a>

* Added a flag to disable compression when communicating with HTTP origins.
  To disable compression, set `disableCompression: true` within the `http` section of the origin's configuration.
* Exposed the maximum number of idle connections to keep open between engine an an HTTP origin.
  To tune the maximum number of idle connections, set `maxIdleConnections: 1234` within the `http` section of the origin's configuration.
  If no value is provided, the default is 100.
* Fixed an issue where Engine would return an empty query duration on internal error.
* Fixed an issue where Engine would return an empty query duration on cache hit.
* Fixed an issue where configuration reloading would not affect cache stores.
* Reduced the overhead of reporting while it is disabled.
* Added support for GraphQL `"""block strings"""`.
* *Breaking*: Added `name` field to origin configurations. Every defined origin must have a unique name (the empty string is OK).
  This only affects configurations with multiple origins, which should be rare.

**2017.11-137-g908dbec6f - 2017-12-05**
<a name="v2017.11-137-g908dbec6f"></a>

* Improved persisted query handling so that cache misses are not treated like other GraphQL errors.
* Fixed an issue where GraphQL query extensions (like `persistedQuery`) would be forwarded to the origin server. This caused issues with origins other than Apollo Server.

**2017.11-121-g2a0310e1b - 2017-11-30**
<a name="v2017.11-121-g2a0310e1b"></a>

* Improved performance when reverse proxying non-GraphQL requests.
* Removed `-restart=true` flag, which spawned and managed a child proxy process. This was only used by the `apollo-engine` Node.js package.
* Added POSIX signal processing:
  * On `SIGHUP`, reload configuration. Configurations provided through `STDIN` ignore `SIGHUP`.
  * On `SIGTERM`, or `SIGINT`, attempt to send final stats and traces  before gracefully shutting down.
* Added the ability to prevent certain GraphQL variables, by name, from being forwarded to Apollo Engine servers. The proxy replaces these variables with the string `(redacted)` in traces, so their presence can be verified but the value is not transmitted.

  To blacklist GraphQL variables `password` and `secret`, add: `"privateVariables": ["password", "secret"]` within the `reporting` section of the configuration. There are no default private variables.
* Added the option to disable reporting of stats and traces to Apollo servers, so that integration tests can run without polluting production data.

 To disable reporting, add `"disabled": true` within the `reporting` section of the configuration. Reporting is enabled by default.
* Added the ability to forward log output to `STDOUT`, `STDERR`, or a file path. Previously logging was always sent to `STDERR`.

 To change log output, add `"destination": "STDOUT"` within the `logging` section of the configuration.
 Like query/request loggings, rotation of file logs is out of scope.
* Fixed an issue where `Content-Type` values with parameters (e.g. `application/json;charset=utf=8`) would bypass GraphQL instrumentation.
* Added support for the Automatic Persisted Queries protocol.

**2017.11-84-gb299b9188 - 2017-11-20**
<a name="v2017.11-84-gb299b9188"></a>

* Fixed GraphQL parsing bugs that prevented handling requests containing list literals and object literals.
* Added the ability for the proxy to output JSON formatted logs.
* Fixed a bug with reverse proxying to HTTPS origins.

**2017.11-59-g4ff40ec30 - 2017-11-14**
<a name="v2017.11-59-g4ff40ec30"></a>

* Fixed passing through custom fields on GraphQL errors.

**2017.11-40-g9585bfc6 - 2017-11-09**
<a name="v2017.11-40-g9585bfc6"></a>

* Fixed a bug where query parameters would be dropped from requests forwarded to origins.

* Added the ability to send reports through an HTTP or SOCKS5 proxy.

  To enable reporting through a proxy, set `"proxyUrl": "http://192.168.1.1:3128"` within the `reporting` section of the configuration.

* Added support for transport level batching, like [apollo-link-batch-http](https://github.com/apollographql/apollo-link/tree/master/packages/apollo-link-batch-http).

  By default, query batches are fractured by the proxy and individual queries are sent to origins, in parallel.
  If your origin supports batching and you'd like to pass entire batches through, set `"supportsBatch": true` within the `origins` section of the configuration.

* *BREAKING*: Changed behaviour when the proxy receives a non-GraphQL response from an origin server.
  Previously the proxy would serve the non-GraphQL response, now it returns a valid GraphQL error indicating that the origin failed to respond.

* Added support for the `includeInResponse` query extension. This allows clients to request GraphQL response extensions be forwarded through the proxy.

  To instruct the proxy to strip extensions, set: `"extensions": { "strip": ["cacheControl", "tracing", "myAwesomeExtension"] }` within the `frontends` section of the configuration.
  By default, Apollo extensions: `cacheControl` and `tracing` are stripped.

  Stripped extensions may still be returned if the client requests them via the `includeInResponse` query extension.
  To instruct the proxy to _never_ return extensions, set `"extensions": { "blacklist": ["tracing","mySecretExtension"] }` within the `frontends` section of the configuration.
  By default, the Apollo tracing extension: `tracing` is blacklisted.

* *BREAKING*: Fixed a bug where literals in a query were ignored by query cache lookup. This change invalidates the current query cache.

* Fixed a bug where the `X-Engine-From` header was not set in non-GraphQL requests forwarded to origins. This could result in an infinite request loop in the Node.js `apollo-engine` package.

**2017.10-431-gdc135a5d - 2017-10-26**
<a name="v2017.10-431-gdc135a5d"></a>

* Fixed an issue with per-type stats reporting.

**2017.10-425-gdd4873ae - 2017-10-26**
<a name="v2017.10-425-gdd4873ae"></a>

* Removed empty values in the request to server: `operationName`, `extensions`.
* Improved error message when handling a request with GraphQL batching. Batching is still not supported at this time.


**2017.10-408-g497e1410**
<a name="v2017.10-408-g497e1410"></a>

* Removed limit on HTTP responses from origin server.
* Fixed issue where the `apollo-engine` Node.js package would fail to clean up sidecar processes.
* Switched query cache compression from LZ4 to Snappy.
* *BREAKING*: Renamed the `logcfg` configuration section to `logging`.
* *BREAKING*: Nested HTTP/Lambda origin configurations under child objects: `http` and `lambda`.
* Added HTTP request logging, and GraphQL query logging options.

These changes mean that a basic configuration like:

```
{
  "apiKey": "<ENGINE_API_KEY>",
  "logcfg": {
    "level": "INFO"
  },
  "origins": [
    {
      "url": "http://localhost:3000/graphql"
    }
  ],
  "frontends": [
    {
      "host": "127.0.0.1",
      "port": 3001,
      "endpoint": "/graphql"
    }
  ]
}
```

Is updated to:

```
{
  "apiKey": "<ENGINE_API_KEY>",
  "logging": {
    "level": "INFO"
  },
  "origins": [
    {
      "http": {
        "url": "http://localhost:3000/graphql"
      }
    }
  ],
  "frontends": [
    {
      "host": "127.0.0.1",
      "port": 3001,
      "endpoint": "/graphql"
    }
  ]
}
```


**2017.10-376-g0e29d5d5**
<a name="v2017.10-376-g0e29d5d5"></a>

* Added (debug) log message to indicate if a query's trace was selected for reporting.
* Fixed an issue where non-GraphQL errors (i.e. a `500` response with an HTML error page) would not be tracked as errors.

