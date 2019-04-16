---
title: Working with traces
description: How to analyze field-level metrics with Apollo
---

Engine tracks all queries that clients send to your GraphQL API. We often prefer to call these "operations", a term that includes both GraphQL queries and mutations. The execution timing of individual operations and fields is always aggregated into statistics that are sent to Engine (see [performance analytics](performance.html) for more information), and sometimes additional detail is included.

<h2 id="trace">Resolver execution</h2>

Execution of a GraphQL query happens layer by layer, and each field in the query calls a function in your server called a resolver. The _Trace_ view in the Engine UI allows you to look at a detailed breakdown of the execution of one query, with timing for every resolver.

![Trace view](../img/trace.png)

The full query associated with the trace can be viewed by hovering over the operation's name in the operation sidebar.

![Operation view](../img/operation.png)

If you want to read about the design decisions behind the _Trace_ view in Engine in depth, check out the [excellent blog post from Danielle Man](https://dev-blog.apollodata.com/the-new-trace-view-in-apollo-engine-566b25bdfdb0), one of the engineers that built it.

<h3 id="available-traces">Available traces</h3>

At the top of the _Trace_ view, right under the Request Latency Distribution histogram, you can see a line with dots on it, where each dot matches up with a bucket in the histogram. This allows you to look at a sample trace for a particular request duration. For example, if you want to see a trace of a particularly slow execution of this query, you can click on one of the dots further on the right.

<h3 id="critical-path">Critical path</h3>

When you first open the trace view, some of the fields are collapsed and some are open. It's not random; in fact the default view is showing you a very helpful piece of information which is the "critical path" of the query. This is the set of fields and resolvers which is the longest sequence in the query. Therefore, if you are trying to speed up your execution this is the set of fields you should probably look into first.

<h3 id="expanding">Expanding fields</h3>

Some of the fields have a gray oval around them. These are fields that can be expanded and collapsed to see additional fields underneath them. A GraphQL query is a tree, so we display the performance information in the same way. We actually keep track of the relationships between the fields, so you can have a GraphQL-centric understanding of your performance that you wouldn't get from a generic tracing tool.

<h2 id="sampled-traces">Trace inspector</h2>
When Engine deems that a particular sample is interesting enough to be recorded as a full [Trace](performance.html#trace), the complete resolver timings, individual variables, and HTTP request headers are captured and stored by Engine as well.  These traces can be incredibly useful to understand specific examples of queries that have been run on your GraphQL API.  Using the _Trace Inspector_, you can see the operation string that was sent, along with the variables and headers that were collected by Engine for this trace:

![Trace Inspector](../img/trace-inspector.png)

<h2 id="operation-signatures">Operation signatures</h2>

In Engine, we want to group requests making the same operation together, and treat different queries distinctly. But what does it mean for two operations to be "the same"? And what if you don't want to send the full text of the operation to Apollo Engine's servers, either because it contains sensitive data or because it contains extraneous operations or fragments?

To solve these problems, Engine has the concept of "signatures". We don't (by default) send the full operation string to the Engine servers. Instead, each reported operation trace sends its operation string in a normalized "signature" form.

<h3 id="transformations">Current signature algorithm</h3>

The current signature algorithm performs the following transformations when generating a signature. (Future improvements to Engine will allow users to customize the signature algorithm.)

- Input argument values are mapped according to the following rules:
  - `Variable`, `BooleanValue`, and `EnumValue` preserved
  - `IntValue` and `FloatValue` replaced by `0`
  - `StringValue` replaced by `""`
  - `ListValue` replaced by `[]`
  - `ObjectValue` replaced by `{}`
- [Ignored tokens](http://facebook.github.io/graphql/draft/#sec-Source-Text.Ignored-Tokens) are removed, including redundant `WhiteSpace`. Single spaces are only preserved when required for parsing the request.
- Only the `OperationDefinition` corresponding to the requested operation and reachable `FragmentDefinition`s are included.
  The operation appears first. Fragment definitions appear in order of first reachability when traversing spread-first, depth-second.
- `Alias`es are removed.
- In `SelectionSet`, fields appear before fragment spreads, fragment spreads appear before inline fragments.
- Otherwise, elements are sorted by name alphanumerically, including `Argument` and `Directive`.
- Otherwise, elements are kept in order. For example in `{north:neigh(dir:NORTH) east:neigh(dir:EAST)}`, `EAST` should always appear after `NORTH`.

For example:

```
query Foo {
  user(id : "hello") {
    ... Baz
    timezone
    aliased: name
  }
}
fragment Baz on User {
  dob
}
```

becomes

```
query Foo{user(id:""){name timezone...Baz}}fragment Baz on User{dob}
```

> See the reference implementation of [query signatures](https://github.com/apollographql/apollo-tooling/blob/7e1f62a8635466e653d52064745bf8c66bb7dd10/packages/apollo-graphql/src/operationId.ts#L60) for more information.

<h3 id="signatures-sensitive-data">Signatures and sensitive data</h3>

The signature algorithm is primarily designed to make it possible to treat operations that differ only in trivial ways as the same operation. It also happens that removing the content of string literals appears to achieve greater data privacy within Engine, but this is not the primary goal. In fact, Engine also sends the full raw query along with traces (though it does not currently expose them in the user interface), so relying on the signature to ensure sensitive data never hits Engine's servers is inappropriate.

Future versions of Engine are likely to change this default algorithm to leave string literals alone, though it will still be easy to configure your server to remove string literals like in the current implementation. We also intend to stop sending the full raw query in future versions of Engine, so that the signature algorithm really can be used to avoid sending sensitive data in queries to Engine.

But where possible, we strongly advise that you keep sensitive data in GraphQL variables instead of in literal arguments in the query body, as you can more easily control which variables should be stripped out of the Engine reporting pathway for privacy purposes. See [data privacy](../data-privacy.html) for further detail on how this works.

<h2 id="tracking-subs">A note on GraphQL subscriptions</h2>

Engine does not currently track statistics or traces for subscriptions. The proxy does, however, support the transparent pass-through of subscription requests and responses.
