---
title: Identifying clients
description: What is client awareness and how to add it to the Apollo Platform
---

Client identity is central to the Apollo Platform and enables tracking how all
the consumers use the data graph. The Apollo Platform allows **segmenting usage
data by client name and version**. Filtering by client provides a
**field-level understanding** of how the consumers interact with the GraphQL api in
real-time. In addition to per-client metrics, understanding this granular
detail informs **how the GraphQL schema can evolve** and react to new **client
releases**.

![client overview](../img/client-awareness/overview.png)

Often a GraphQL api is used by multiple consumers with different frequencies,
subselections, and permissions. The Apollo Platform allows tagging all reported
metrics with client name and version, which enables filtering on a specific
client or set of clients across different stacks. This segmentation provides:

1. Queries and fields used by each clients
2. Client importance based on relative usage

## Setup

By default, Apollo Server >=2.2.3 looks at the request headers for `apollographql-client-name` and `apollographql-client-version`.
With Apollo Client >2.4.6, we set the `name` and `version` inside of the `ApolloClient` constructor:

```js line=8-9
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'http://localhost:4000/graphql',
  }),
  name: 'insert your client name',
  version: 'insert your client version',
});
```

If you are not using Apollo Server and would like to gain client awareness,
please reach out to opensource [at] apollographql.com to work with us to add
support to your server language of choice.

## Use Cases

### Isolating Clients

Filtering queries by client enables isolation of issues that affect a portion
of all clients. In the opposite sense, if a client becomes problematic, such as
requesting expensive fields or using deprecated fields, the Apollo Platform
enables tracking down the faulty client to start solving the issue with the
owner. When changing, replacing, or deprecating a field in the api, the client
metadata enables quickly identifying the client-side changes that need to
occur to completely remove the field.

![client field](../img/client-awareness/field-usage.png)

### Cutover

Similarly to deprecation, additions to a GraphQL api often mean that clients will change. These modifications can be done incrementally or discretely during a cutover period. The cutover period and time immediately following change the utilization of the GraphQL api drastically and can expose some unexpected behavior. Filtering by client version enables monitoring the health of a release in real-time. The following demonstrates a cutover from one backend to another.

![druid cutover](../img/client-awareness/cutover.png)


## Advanced Setup

Client awareness is a full stack solution that threads client information from
the consumer to server, so we can configure the client and server.

### Client

The client or consumer of the GraphQL api is responsible for including the
information in a way that the server understands. In this case, we add the
client name and version to the http headers:

```js line=8-11
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { ApolloLink } from 'apollo-link';

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'http://localhost:4000/graphql',
    headers: {
      'client-name': 'Web',
      'client-version': '1',
    },
  }),
});
```

### Server

The server is responsible for collecting and assigning the client information
to a request. To provide metrics to the Apollo Platform, pass a
`generateClientInfo` function into the `ApolloServer` constructor. The
following checks the headers and provides a fallback.

```js line=8-16
const { ApolloServer } = require('apollo-server');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  engine: {
    apiKey: 'YOUR API KEY HERE',
    generateClientInfo: ({
      request
    }) => {
      const headers = request.headers;
      return {
        clientName: headers && headers['client-name'] || 'Unknown Client',
        clientVersion: headers && headers['client-version'] || 'Unversioned',
      };
    },
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
```

