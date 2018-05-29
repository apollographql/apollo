---
title: "Monitoring"
description: "Keeping an eye on your server"
---

GraphQL-based APIs provide selective access to data which enables developers to avoid potentially expensive data operations that might occur with legacy databases, remote REST endpoints or otherwise slow operations.

As with any resource, performance monitoring is important.  GraphQL has some additional considerations over traditional REST-based APIs, 

# Field-level monitoring

Apollo Server enables field-level timing metrics using the [Apollo Tracing format specification](https://github.com/apollographql/apollo-tracing).  This tracing utilizes [GraphQL extensions]() to automatically augment all GraphQL operations and discover exactly how each field is performing.

Field-level performance metrics are incredibly valuable for front-end developers.  As an example, consider a situation where a developer wants to introduce an additional field to a query which occurs on a website’s most popular page where current query execution takes about 400 milliseconds.  The additional (hypothetical) field is already exposed through the API, but the developer can see that the historical performance of this field on a different page shows it taking around 800 milliseconds.  Before slowing down the most popular page by nearly 50%, the developer can decide if the additional delay is worth it, or work to improve the field’s performance first.

# Operation-level monitoring

# Monitoring the endpoint itself

## ENGINE

## formatError

## logFunction?

* logFunction should be documented https://github.com/apollographql/apollo-server/blob/master/packages/apollo-server-core/src/runQuery.ts#L64
* https://github.com/apollographql/apollo-server/issues/688 is suggesting that we should _not_ document it? I don’t agree with that, but that’s the stated -jesse
