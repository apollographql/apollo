---
title: "4. Run your graph in production"
description: Start here for the Apollo fullstack tutorial
---

<h2 id="deploy">Deploy your graph API</h2>

There are several services you can deploy your graph API to such as Heroku, Amazon Lambda, Netlify and Zeit's Now.  We'll deploy our graph API to Zeit's **Now**. Now is a service by Zeit that allows the deployment of an instance of Apollo Server, quickly providing a functional GraphQL endpoint.

You need the following before deployment:

* A [Now](https://zeit.co/now) account.
* The [Now CLI](https://zeit.co/download#now-cli).

Now looks for a `start` script in the `package.json` file to start the app. Once the script is present, Now will be able to start the app.

Go ahead and run the `now` command from the root directory of the app.

```bash
$ now
```

The `now` command immediately deploys your graph API to the cloud and returns the hosted URL. The returned URL comes in this format: `<NOW_APP_NAME>.now.sh`.

You can now query your graph service at `<NOW_APP_NAME>.now.sh/graphql`.

Now also supports direct deployment from a GitHub repository. If your graph API is publicly available on GitHub, you can deploy it via the `now` command like so:

```bash
now <github-username>/<repository-name>
```

<h2 id="publish-schema">Publish your schema to Engine</h2>

Safely evolving your schema overtime requires a lot of developer efforts in ensuring that clients consuming your API do not break as a result of schema changes. The Apollo platform provides the ability to publish your schema to Engine via the [Apollo CLI](https://npm.im/apollo).

[Apollo Engine](https://engine.apollographql.com), provides deep insights into your graph layer that enables you to understand, optimize, and control your graph service in production with confidence.

Once you publish your schema to Apollo Engine, it becomes the basis for comparison for validating future schemas and avoiding breaking changes. Therefore, a schema should be re-published to Apollo Engine each time a new schema is deployed.

Go ahead and install the `apollo` CLI via npm:

```bash
npm install --global apollo
```

To publish a schema, start your GraphQL server and run the command below:

```bash
apollo schema:publish --key="<API_KEY>" --endpoint="https://<now_app_name>.now.sh/graphql"
```

**Note:** An API key can be obtained from a graph service’s _Settings_ menu within the [Apollo Engine dashboard](https://engine.apollographql.com).

The `--endpoint` flag should be set to the URL of a running GraphQL server.

Every time your schema is updated, run the `apollo schema:publish` command so that Apollo Engine can provide a history of schema changes. This allows everyone on your team to know when new types and fields are added or removed. Apollo Engine also provides a reference to the commits that introduced changes to the schema.

To check the difference between the current schema and a newly published schema version, you can run the command below:

```bash
apollo schema:check --key="<API_KEY>" --endpoint="https://<now_app_name>.now.sh/graphql"
```

Apollo Engine identifies three categories of changes and report them to the developer on the command line or within a GitHub pull-request:

* **Failure:** Either the schema is invalid or the changes will break current clients.
* **Warning:** There are potential problems that may come from this change, but no clients are immediately impacted.
* **Notice:** This change is safe and will not break current clients.

<h2 id="monitoring">Monitor your graph's performance</h2>

You need a bird's-eye view of your graph's API. Understanding how your schema fields, and queries operates within your graph service opens you to a whole new world of effective optimization and scaling!

In order to get access to your graph's performance metrics, hook up Apollo Server with Engine.

First, get an API key from [Engine](https://engine.apollographql.com). Now, connect to Engine by passing the API key to the Apollo Server constructor:

_src/index.js_

```js
// Set up Apollo Server
const server = new ApolloServer({
  ...
  ...
  engine: process.env.ENGINE_API_KEY ? { apiKey: process.env.ENGINE_API_KEY } : undefined,
});
```

Set the `ENGINE_API_KEY` environment variable via the command line:

```bash
$ ENGINE_API_KEY=YOUR_API_KEY npm start
```

Once this is done, you can now have access to all the features that Apollo Engine provides:

* **Schema Explorer:** With Engine's powerful schema registry, you can quickly explore all the types and fields in your schema with usage statistics on each field. This metric makes you understand the cost of a field. How expensive is a field? Is a certain field in so much demand?
* **Schema history:** Apollo Engine’s schema history allows developers to confidently iterate a graph's schema by validating the new schema against field-level usage data from the previous schema. This empowers developers to avoid breaking changes by providing insights into which clients will be broken by a new schema.
* **Performance Analytics:** Fine-grained insights into every field, resolvers and operations of your graph's execution.
* **Query tracing:**  The _Trace view_ in the Engine UI allows you to look at a detailed breakdown of the execution of one query, with timing for every resolver.
* **Performance alerts:** You can configure notifications to be sent to various channels like Slack, and PagerDuty. Apollo Engine can be set to send alerts when a request rate, duration or error rate exceeds a certain threshold. You can effectively monitor everything going on in your graph's service.
