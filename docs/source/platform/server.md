---
title: Apollo Server
description: Build a performant, scalable GraphQL API with Apollo Server
---

[Apollo Server](/docs/apollo-server/v2/) is the best way to quickly build a production-ready, self-documenting API for GraphQL clients, using data from any source.

It's open-source and works great as a stand-alone server, an addon to an existing Node.js HTTP server, or in "serverless" environments.

<div align="center">
  <img src="../assets/apollo-server.svg">
</div>

<h2 id="specifications">Specifications</h2>

The GraphQL specification is the only thing you need to use all the Apollo tools. Thankfully, the core spec has extension points you can use to add functionality.

* Apollo Tracing: A spec for adding performance tracing data to your GraphQL response. [Docs, GitHub](https://github.com/apollographql/apollo-tracing)
* Apollo Cache Control: A spec for adding performance tracing data to your GraphQL response. [Docs, GitHub](https://github.com/apollographql/apollo-cache-control)