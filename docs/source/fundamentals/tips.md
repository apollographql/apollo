---
title: Tips for success
---

TK WIP TODO finish this intro.  Depending on the size of an organization, there are usually existing practices surrounding the management of the data 

## Adopt incrementally

While it makes an excellent longer-term goal, GraphQL doesn’t need to stand above the entire data tree in an organization in order to provide value and expending large amounts of engineering effort to switch an entire stack should generally be avoided.

Unlike some technologies, which are difficult to embrace without getting buy-in from all the teams in an organization, GraphQL can be utilized by smaller units (e.g. component by component, team by team) and later integrated into the bigger picture.

Thanks to GraphQL’s ability to fetch data from any data source, it makes sense to keep existing APIs as they are and use GraphQL to “wrap” the data.  This can be appreciated by organizations with existing collections of REST (or similar) APIs which power their user experiences since they can lean heavily on their existing investments.  This allows small teams to immediately realize many benefits of GraphQL without waiting for deeper adoption and allows existing versions of the application, which have already been deployed and rely on the existing API, to keep functioning uninterrupted.

## Schema scope and ownership

APIs change as the products which use them evolve and their ideal structure is usually defined by the front-end applications which consume them.  While it’s certainly possible, and sometimes desirable, to have a single GraphQL schema which blankets an entire organization’s operational concerns, trying to manage a large schema presents challenges which are avoided by separating the schema into more manageable pieces that align with individual products.

Luckily, the GraphQL Schema Definition Language (SDL) focuses on the shape of the data and not the actual implementation, allowing product teams to be the ideal custodians of their own GraphQL schemas.

Having product teams own the GraphQL schema for their products allows the schema to act as an API contract within the team and enhances intra-team communication by providing clearly defined expectations.  These teams can utilize schema-driven development which lets them divide back-end and front-end work, mocking various parts of the API until full functionality is achieved, while remaining confident that they will arrive back at a unified solution.

Organizations looking to offer a single API endpoint can assemble the individual product schemas, managed by individual product teams into a monolithic API by “stitching” the various schemas together.

## Monitor GraphQL performance

An API implemented using GraphQL allows developers to query the exact information they desire from an API and nothing more.  With proper visibility into how the API performs, developers can understand the implications of adding or removing fields, especially those which might be slow (notoriously or otherwise!).

Apollo Engine is a GraphQL schema management and monitoring tool which provides insight on how a GraphQL API is behaving, and can proactively notify teams of degraded performance.

When using Apollo Server with Apollo Engine, queries and mutations are enhanced with field-level tracing data which power views in Apollo Engine showing how removing a field from a query might speed up a particular component or, conversely, how adding a seemingly innocent field might actually do more harm than good!

In addition to empowering front-end developers to make quick, educated decisions during development, the detailed metrics in Apollo Engine allow those who are responsible for data performance to quickly identify where improvements can be made and be made aware of bottlenecks or rising error rates if issues arise.

This clarity allows pushing schema changes to production with the confidence of knowing that the API is performing as well as it was before, if not better!

## Write the server in JavaScript

Facebook's reference implementation has been written in JavaScript since its original release and fresh developments in the GraphQL ecosystem have frequently appeared first in JavaScript or languages which transpile to JavaScript, like TypeScript.

While existing back-end systems might already be implemented in other languages, a thin, JavaScript-based GraphQL implementation fits nicely in front of such systems and, due to the active maintenance of the JavaScript implementations, can bring the latest in GraphQL features to this existing infrastructure.

Building a GraphQL server in JavaScript also makes it easy to operate at "the edge", where JavaScript is the language of choice, to leverage powerful CDN solutions to deliver data to clients as efficiently as possible - including powerful caching and network optimizations.

And since front-end developers are already using JavaScript to implement the interfaces which consume data from back-end APIs, building a GraphQL API in JavaScript enables those same developers to make meaningful contributions to the APIs they're utilizing.

So while JavaScript GraphQL libraries do see the most active development and the latest features, its also great to have the extra approachability and deployment options which come with the use of the most popular programming language on the Internet.
