---
title: Upgrade to apollo-engine 1.0
---

<!-- Please leave this file here, it's a destination for redirects from the migration guide in the old Engine proxy docs. It does not have any direct links to it in the Platform docs, but that doesn't mean there are no link on the internet that still come here. -->

Version 1.0 of the npm `apollo-engine` package replaces the `Engine` API with a streamlined `ApolloEngine` API. It's straightforward to upgrade your app to the 1.0 API.

## Migrating from `Engine` to `ApolloEngine`

A typical use of the pre-1.0 `Engine` API with an Express server looked like:

```js
import { Engine } from 'apollo-engine';

// create new engine instance from JS config object
const engine = new Engine({
  engineConfig: {
    apiKey: process.env.ENGINE_API_KEY,
  },
  endpoint: '/api/graphql',
  graphqlPort: process.env.PORT,
  startupTimeout: 3000,
});

await engine.start();

// The next line is slightly different on different Node web frameworks.
app.use(engine.expressMiddleware());

// This is the standard Express API:
app.listen(process.env.PORT, () => {
  console.log('Listening!');
);
```

The equivalent in the v1 `ApolloEngine` API looks like:

```js
import { ApolloEngine } from 'apollo-engine';

const engine = new ApolloEngine({
  apiKey: process.env.ENGINE_API_KEY,
});

// No engine.start() or app.use() required!

// Instead of app.listen():
engine.listen({
  port: process.env.PORT,
  graphqlPaths: ['/api/graphql'],
  expressApp: app,
  launcherOptions: {
    startupTimeout: 3000,
  },
}, () => {
  console.log('Listening!');
});
```

Notable differences:

- The API is now called `ApolloEngine` rather than `Engine`. (We changed the name so that people still using `new Engine` get shown a link to this page!)
- The [engine configuration](/references/proxy-config/) is the main argument to `new ApolloEngine` rather than nested inside an `engineConfig` option. The "engine configuration" is the configuration presented to the underlying Engine Proxy binary; other options affect the Node code rather than the inner process.  We moved all the options that configure the Node code to the `listen` call so that it's easy to differentiate between "configuring the Proxy's behavior" and "configuring how we talk to the Proxy binary".
- You don't need to tell Engine to `start()`, nor do you need to connect it to your web framework's middleware at a carefully chosen location. Instead, you replace your web framework's `app.listen()` call with an `engine.listen` call.  See [the Node setup guide](/references/engine-proxy/#option-2-running-a-standalone-proxy-using-node) for how to connect Engine to a web framework other than Express.
- Engine now supports the Restify web framework and version 17 of the Hapi web framework. It is also relatively straightforward to use it with any web framework that works with Node's `http.Server` class.
- You don't need to specify your GraphQL server's port twice (once in the `graphqlPort` option to `new Engine` and once to `app.listen`). You just specify it once to `engine.listen`.
- The `endpoint` option to `new Engine()` is now the `graphqlPaths` option to `engine.listen()`, and it takes an array of paths instead of just one. You still don't need to specify it if your GraphQL server is mounted at `/graphql`.
- The `origin` and `frontend` options to `new Engine()` no longer exist. `new Engine({origin: {requestTimeout: '60s'}})` was a shorthand for `new Engine({engineConfig: {origins: [{requestTimeout: '60s'}]}})`. Now that there's no nested `engineConfig`, we think it's straightforward enough to just write `new ApolloEngine({origins: [{requestTimeout: '60s'}]})` and we don't have to document two very similar ways of doing the same thing.
- If you were directly specifying `endpoint` in the `frontend` or `engineConfig.frontends` option to `new Engine`, that previously-deprecated option no longer exists. You can use the `endpoints` option instead (which takes an array of paths rather than a single path). That said, you can probably specify this as the `graphqlPaths` option to `engine.listen()` instead, or just omit it if it said `'/graphql'`.
- The `startupTimeout`, `proxyStdoutStream`, and `proxyStderrStream` options to `new Engine()` are now nested inside the `launcherOptions` option to `engine.listen()`.
- The `dumpTraffic` option to `new Engine()` no longer exists.

For full details including an API reference, see [the Node setup guide](/references/engine-proxy/#option-2-running-a-standalone-proxy-using-node).

### Behind the scenes

The old API was based on "double proxying". If your web server was supposed to serve on port 4000, you would tell Express (or your other web framework) to listen on port 4000. The `Engine` class would start an instance of the Engine Proxy running on an ephemeral port (say, 4321). You would add a special middleware to your framework which redirects GraphQL requests to `127.0.0.1:4321`. The Engine Proxy would then make GraphQL requests back to your Node server on port 4000.  The middleware used a special header to differentiate between the initial request from an external client and the nearly-identical internal request from Engine. So GraphQL requests are routed `client -> Node -> Engine Proxy -> Node` and non-GraphQL requests are routed `client -> Node`.

This led to several problems. You needed to be careful to insert your middleware into an appropriately early spot in your web framework routing. Logs would show twice as many requests to your GraphQL server as made by external users unless you specifically filtered out the "outer" or "inner" GraphQL request. There was a slight performance overhead of sending requests back and forth from the Proxy. Middleware for different web frameworks look entirely different.

We did offer a "single proxy" mode that avoided some of the above problems, but it was a little clunky to set up as it didn't integrate directly with your web framework.

The new API gets rid of double proxying entirely. When you run `engine.listen({port: 4000, expressApp: app})`, the new `ApolloEngine` class starts an instance of your app running on an ephemeral port (say, 4321). It then starts the Engine Proxy itself on port 4000, proxying all requests to `127.0.0.1:4321`. All requests are consistently routed `client -> Engine Proxy -> Node`.

This resolves all of the problems listed above. Because there's no "middleware" involved, the Engine Proxy is always inserted at the right place in the network: in front of your app. You can't accidentally add the middleware too late. Your app only sees one request per client request, or zero if [Engine caching](/references/engine-proxy/#caching) is doing its job! There's only one layer of local proxying rather than two. Finally, because most web frameworks have very simple similar-looking `listen` functions, adding support for new web frameworks is easy (which is why v1 adds support for Restify and arbitrary `http.Server`-based frameworks).

This does mean that *all* of the HTTP traffic on your server is now routed through the Engine Proxy, whereas before non-GraphQL traffic avoided that hop. The Engine Proxy uses the industry-standard Go reverse proxy library to transparently proxy non-GraphQL HTTP and Websocket traffic, so you should observe no major difference.  If you do find any problems from running non-GraphQL traffic through the Engine Proxy, please [let us know](https://engine.apollographql.com/login?overlay=SupportRequestNoAccount), or consider running your GraphQL server separately from other servers.


## Upgrading the Docker container to v1 and a new way to run the proxy

While most pre-v1 Apollo Engine users use the `Engine` API from the `apollo-engine` npm module to run Engine against Node origins, we also provide the Engine Proxy in a Docker container. This is primarily intended for use with non-Node GraphQL servers.

The Docker container is mostly unchanged in v1.  Here's what's new:

- We now use the same version numbers for the Docker containers as for the npm module, so the first v1 Docker container has the tag `1.0.1` rather than `2018.02-90-g65206681c`. (This may mean that in the future, two consecutive Docker versions will be identical if the only changes in that version are to the Node wrapper code.)
- We recognize that running Docker containers is not feasible in all deployment environments. If you are deploying your non-Node GraphQL server to an environment that can still run Node programs, we've added a new class, `ApolloEngineLauncher`, to the `apollo-engine` npm module. This allows you to write a short Node script to run the Engine Proxy binary with arbitrary configuration without the extra Node web framework integration provided by the `ApolloEngine` class documented above.
- The deprecated `endpoint` field is removed from `frontends` configuration. Put your endpoint (GraphQL URL path) in a list in `endpoints` instead, or omit it if it's `'/graphql'`.
- It is now valid to specify zero frontends. Engine Proxy will default to one with all default values (listening on an ephemeral port).
- If you configure a frontend endpoint as `/graphql`, requests to `/graphql/` should be served also. (This previously worked if you were using the `Engine` double proxy mode but not with the Docker container.)


## Automatic cache store configuration

Prior to Engine v1, the features that require an in-memory or memcached cache store ([public and private full-query response cache](/references/engine-proxy/#caching), [automatic persisted queries](https://www.apollographql.com/docs/apollo-server/features/apq), and the session token authorization cache) required you to manually configure a cache store and enable them.

As of Engine v1, these features are on unless specifically disabled, and by default they use a 50MB in-memory cache.

Specifically, the public full-query response cache and automatic persisted query cache are on by default; the private full-query response cache is on if `sessionAuth` is configured; and the session token authorization cache is on if `tokenAuthUrl` is configured.

To disable any of these features, just set the corresponding cache name field in the Engine configuration (ie, the argument to `new ApolloEngine`) to `'disabled'`.
