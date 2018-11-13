---
title: Identifying clients
description: What is client awareness and how to add it to the Apollo Platform
---

Client identity is central to the Apollo Platform and enables tracking how all
the consumers use the data graph. The Apollo Platform allows segmenting usage
data by client name and version. Filtering by client information provides a
field-level understanding of how the users interact with the GraphQL api in
real-time. In addition to per client metrics, understanding this granular
detail informs how the GraphQL schema can evolve and reacts to a new client
release.

## Use Cases

Often a GraphQL api is used by multiple consumers with different frequencies,
subselections, and permissions. The Apollo Platform accepts client name and
version, tracking these requests across the stack and enabling filtering on
both dimensions. This segmentation provides an understanding of which queries
and fields are required by clients. Conversely, this breakdown also indicates
which clients are important based on relative usage.

![client overview](../img/client-awareness/overview.png)

In addition to understanding how clients use a GraphQL api, the Apollo Platform
enables effective isolation and rapid triage for issues that affect a single
client or portion of clients begin to experience issues, by filtering out of
the functional clients. In the opposite sense, if a certain client becomes
problematic, such as requesting expensive fields or using deprecated fields,
the Apollo Platform enables tacking down the misbehaving client to start a
conversation with the owner and move toward solving the issue. When changing,
replacing, or deprecating a field in the api, the client metadata enables
quickly identifying down the client side changes that need to occur.

![client field](../img/client-awareness/field-usage.png)

Similarly to deprecation, additions to a GraphQL api often means that a client will change. These client changes can be done incrementally or discretely during a cutover period. The cutover period and time immediately following change the utilization of the GraphQL api drastically and can expose some unexpected behavior. Filtering by client version enables monitoring the health of a release as it occurs. The following demonstrates a cutover from one backend to another.

![druid cutover](../img/client-awareness/cutover.png)

## Setup

Client awareness is a full stack solution that threads client information from
the consumer to server, so we need to add some code to the server and client.

### Server

The server is responsible for collecting and assigning the client information
to a request.. To provide metrics to the Apollo Platform, pass a
`generateClientInfo` function into the `ApolloServer` constructor. The
following checks the GraphQL query `extensions` for a `clientInfo` field and
then provides a fallback.

```js line=8-20
const { ApolloServer } = require("apollo-server");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  engine: {
    apiKey: "YOUR API KEY HERE",
    generateClientInfo: ({
      request
    }) => {
      const extensions = request.extensions;
      if (extensions && extensions.clientInfo) {
        return extensions.clientInfo;
      } else {
        return {
          clientName: "Unknown Client",
          clientVersion: "Unversioned",
        };
      }
    },
  }
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
```

### Client

The client or consumer of the GraphQL api is responsible for including the
information in a way that the server understands.In this case, we add the
client name and version to the `extensions` field. We do this by defining a
custom `ApolloLink`:

```js line=9-12
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { ApolloLink } from 'apollo-link';

const client = new ApolloClient({
  link: ApolloLink.from([
    new ApolloLink((operation, forward) => {

      operation.extensions.clientInfo = {
        clientName: 'Web',
        clientVersion: '1',
      };

      operation.setContext({
        http: {
          includeExtensions: true,
        },
      });

      return forward(operation);
    }),
    new HttpLink({
      uri: 'http://localhost:4000/graphql',
    })
  ]),
});
```
