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

* New `reporting.noTraceErrors` option to disable sending error traces to Apollo servers. Use this if your error messages may contain [personal data](https://en.wikipedia.org/wiki/Personal_data). If you are interested in a more fine-grained way to configure this, contact <a href="https://engine.apollographql.com/support">Apollo support</a>.
* Fix problems running `ApolloEngine` when a corporate HTTP proxy is configured with an environment variable such as `$HTTP_PROXY`. (Specifically, make the default `innerHost` option to `engine.listen` actually be `127.0.0.1` as documented rather than the unspecified interface; the previously implemented default was unintentional as well as the cause of the corporate proxy bug.)

<h3 id="v1.0.5" title="v1.0.5">1.0.5 - 2018-04-05</h3>

This release include a variety of changes related to caching.

* The Engine Proxy now observes the `Vary` header in HTTP responses. See the new [documentation of cache header support](/references/engine-proxy/#caching) for more details.
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

* Add `overrideGraphqlResponseHeaders` frontend configuration option. This option lets you set HTTP headers to be sent with all GraphQL HTTP responses. For now, this is required to avoid CORS errors if you use [persisted queries](https://www.apollographql.com/docs/apollo-server/features/apq) from clients from a different origin from your GraphQL (Engine) frontend.
* Fix bug where certain malformed GraphQL requests were reported to Engine as having taken multiple millennia.
* Improve support for `application/graphql` requests. We still recommend sending your requests as JSON, which is supported by more servers and supports variables, operation name, and client-to-server extension, but we now deal better with `application/graphql` requests if you send them.
* Improve error handling when your GraphQL origin sends Engine an unsupported Content-Type.

<h3 id="v1.0.1" title="v1.0.1">1.0.1 - 2018-03-07</h3>

v1 of `apollo-engine` has a redesigned streamlined Node API called `ApolloEngine`. See [the 1.0 migration guide](/references/engine-proxy-1.0-migration/) for details on how to upgrade.  In addition to a simplified API and higher performance, the new API adds support for the Restify and Hapi v16 web frameworks, and it is easy to integrate with any Node web framework that works with `http.Server`.

If you aren't integrating with a Node GraphQL server but still find Node programs easier to run than Docker Containers, the `apollo-engine` npm module has a new API called `ApolloEngineLauncher` that allows you to run the Engine Proxy with arbitrary configuration without hooking into a Node GraphQL server.

Features that used to depend on a caching store definition now are on by default, sharing a 50MB in-memory cache. Specifically:
* The public full-query response cache is enabled by default. Only responses annotated with the `cache-control` extension are cached.
* The private full-query response cache is enabled by default if `sessionAuth` is configured. Only responses annotated with the `cache-control` extension are cached.
* Automatic persisted queries are on by default.
* If `sessionAuth` is configured with a `tokenAuthUrl`, verifications are cached by default.
If you don't like these defaults, you can set each store name field to `"disabled"` to turn off the relevant feature. If you want to change the default cache size in bytes, add `stores: [{inMemory: {cacheSize: 123456}}]` to your Engine config (ie, the argument to `new ApolloEngine()`). If you want to change the default cache to memcached, add `stores: [{memcache: {url: ["localhost:1234"]}}]` to your Engine config.

Starting with v1, the Docker container releases use the same version numbers as the `apollo-engine` npm releases. The following changes are mostly relevant to users of the Docker container:
* It's valid to specify zero frontends. Engine Proxy will default to one with all default values.
* The deprecated `endpoint` field is removed from `frontends` configuration. Put your endpoint (GraphQL URL path) in a list in `endpoints` instead, or continue to let `apollo-engine` set it for you.
* The `endpoints` field on frontends now defaults to `["/graphql"]` instead of being required.
* The header secret feature (required so that double proxying middleware could tell if it's seeing the request for the first or second time) is removed. This was intended only for internal use by `apollo-engine`.
* If you configure a frontend endpoint as `/graphql`, requests to `/graphql/` should be served also. (The `apollo-engine` `Engine` wrapper previously implemented this; now it is implemented natively inside the Engine Proxy.)
* A bug that could lead to the warning `Encountered trace without end time. This is a bug in Engine proxy.` has been fixed.


(v1.0.0 was a mistakenly published empty package from the beginning of apollo-engine's development. Do not use v1.0.0 --- go directly to v1.0.1!)


<h3 id="v0.9.1" title="v0.9.1">0.9.1 - 2018-03-01</h3>

* The `prettier` package was accidentally added as a dependency rather than a dev-only dependency in 0.9.0. It is now in devDependencies.

<h3 id="v0.9.0" title="v0.9.0">0.9.0 - 2018-03-01</h3>

Simplify how the apollo-engine npm module communicates with the Engine Proxy binary.  Backwards-incompatible changes:
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

<h3 id="v0.8.10" title="v0.8.10">0.8.10 - 2018-02-12</h3>

* Added support for GZIP content encoding for responses from Lambda origins.
* Added support for function qualifiers for Lambda origins.
* Allows per-endpoint origin specification on frontends via `endpointMap`, a &lt;string,string&gt; map from endpoint path to `originName`. Users can use this field instead of `endpoints` and `originName` to route different URL paths on a frontend to serve different origins. If `endpointMap` is set, the Proxy will return a 404 error to HTTP requests sent to paths that don't match one of its keys. The proxy will also verify that only one of `endpoint` [deprecated], `endpoints`, and `endpointMap` are set.
	* For example, if you have two origins with names `[adminOrigin, userOrigin]` and want to forward requests to `/admin` and `/user` respectively, on the `Frontend` config, specify `"endpointMap": {"/admin":"adminOrigin", "/user":"userOrigin"}` and do not specify `endpoint` or `endpoints`.
* Fixed a bug where all custom extensions were assumed to be maps.

<h3 id="v0.8.9" title="v0.8.9">0.8.9 - 2018-02-06</h3>

* Fixed a bug where `Host` header was still not forwarded to origin servers if present.
* Exposed stats field to better track Engine proxy memory usage.
* Properly forward the Host header to the Engine Proxy.
* New `logger` option to override some aspects of logging in apollo-engine. (Removed in 0.9.0.)
* Do not override http origin url if set.
* Allow endpoint to end with '/' or '\'.

### 2018.01-54-gce490265c - 2018-01-31

* Fixed a bug where the `Host` header was not forwarded to origin servers. If the `Host` header is present, it will also be sent in the `X-Forwarded-Host` header. Both of these header values can be overridden via the field mentioned below.
* Added the ability for users to override which headers are sent to their GraphQL origin. Users can do this by specifying the `overrideRequestHeaders` field in `origin.http` in the Engine config object. By default Engine will forward all header values it receives to the origin server. This field is only for users that want to override the default behavior.
  * For example, to override the `Host` header which may need to be done when deploying Engine inside of a PaaS (such as Heroku) follow instructions [here](/references/engine-proxy/#option-4-running-the-proxy-through-a-platform-as-a-service-eg-heroku).

### 2018.01-43-g1747440e6 - 2018-01-29

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

### 2018.01-17-g9c203510f - 2018-01-16

* Fixed an issue where a data race could cause the proxy to crash.

### 2018.01-1-gc024df504 - 2018-01-04

* Added a flag to disable certificate validation when communicating with HTTPS origins.
  To disable certificate validation, set `disableCertificateCheck: true` within the `http` section of the origin's configuration.
  This is strongly discouraged, as it leaves Engine vulnerable to man-in-the-middle attacks. It is intended for testing only.

* Added a flag to use custom certificate authorities when communicating with HTTPS origins.
  To use custom certificate authorities, set: `trustedCertificates: /etc/ssl/cert.pem` (or another file path) within the `http` section of the origin's configuration.
  CA certificates must be PEM encoded. Multiple certificates can be included in the same file.

### 2017.12-45-g12ba029f9 - 2017-12-20

* Added support for multiple endpoints per origin through a new `endpoints` setting, deprecated the previous `endpoint` setting.
* Added a health check URL at `/.well-known/apollo/engine-health`, currently returning HTTP status 200 unconditionally.
* Fixed an issue where reports would always be sent on shut down, even when reporting was disabled.
* Fixed issues with reloading of `frontend`s, and dependencies like logging and caches.

### 2017.12-28-gcc16cbea7 - 2017-12-12

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

### 2017.11-137-g908dbec6f - 2017-12-05

* Improved persisted query handling so that cache misses are not treated like other GraphQL errors.
* Fixed an issue where GraphQL query extensions (like `persistedQuery`) would be forwarded to the origin server. This caused issues with origins other than Apollo Server.

### 2017.11-121-g2a0310e1b - 2017-11-30

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

### 2017.11-84-gb299b9188 - 2017-11-20

* Fixed GraphQL parsing bugs that prevented handling requests containing list literals and object literals.
* Added the ability for the proxy to output JSON formatted logs.
* Fixed a bug with reverse proxying to HTTPS origins.

### 2017.11-59-g4ff40ec30 - 2017-11-14

* Fixed passing through custom fields on GraphQL errors.

### 2017.11-40-g9585bfc6 - 2017-11-09

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

### 2017.10-431-gdc135a5d - 2017-10-26

* Fixed an issue with per-type stats reporting.

### 2017.10-425-gdd4873ae - 2017-10-26

* Removed empty values in the request to server: `operationName`, `extensions`.
* Improved error message when handling a request with GraphQL batching. Batching is still not supported at this time.


### 2017.10-408-g497e1410

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

### 2017.10-376-g0e29d5d5

* Added (debug) log message to indicate if a query's trace was selected for reporting.
* Fixed an issue where non-GraphQL errors (i.e. a `500` response with an HTML error page) would not be tracked as errors.
