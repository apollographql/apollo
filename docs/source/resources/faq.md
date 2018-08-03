---
title: Frequently Asked Questions
description: Some of the most important questions at each stage of development
---

Everyone has questions about how to properly set up a GraphQL schema, but not all questions are alike. In different stages of development, different things matter. This guide will questions that people commonly have have at every step along the journey to GraphQL in production.

<!-- -->
<!-- -->
<!-- -->
<!-- -->
<!-- -->
<!-- -->

## Learning GraphQL

> People in this phase are just beginning to learn GraphQL. They are trying to get a sample project up and running.

#### Why use GraphQL?

Read more about the benefits of GraphQL [here](../fundamentals/benefits.html).

#### Where can I learn the basics of GraphQL?

[TODO]()

#### How can I host my schema online?

A great tool for learning and building small projects is [Glitch](https://glitch.com). Glitch allows development of a schema in the browser, and even supports cloning from and pushing to GitHub. Glitch provides a public endpoint that projects can query against. To get started with building a GraphQL schema, try using and remixing the [Apollo Launchpad](https://glitch.com/~apollo-launchpad) project.

GraphQL schemas written with `apollo-server` can be deployed anywhere that other Node.js projects can be deployed. `apollo-server` even has variants to support serverless deployment with AWS Lambda.

There are deployment guides currently written for [Heroku](https://www.apollographql.com/docs/apollo-server/deployment/heroku.html), [Lambda](https://www.apollographql.com/docs/apollo-server/deployment/lambda.html), and [Now](https://www.apollographql.com/docs/apollo-server/deployment/now.html)

#### How do I connect my client app to my schema?

There are many tools available to connect any kind of client to a schema. The most common are [Apollo Client](https://www.apollographql.com/docs/react/) for JavaScript clients,
[Apollo iOS](https://www.apollographql.com/docs/ios/) for native iOS clients, and [Apollo Android](https://github.com/apollographql/apollo-android) for native Android clients.

For Apollo Client projects, there are also many view-layer integrations, to make querying GraphQL schemas easier in [React](https://www.apollographql.com/docs/react/essentials/get-started.html), [Vue](https://github.com/Akryum/vue-apollo), and [Angular](https://www.apollographql.com/docs/angular/).

<!-- -->
<!-- -->
<!-- -->
<!-- -->
<!-- -->
<!-- -->

## Building a proof of concept

> People in this phase understand how GraphQL works, and what benefits it offers. They are trying to create a proof of concept for their projects or their company to test GraphQL's viability in production

#### How do I wrap existing APIs?

One of the best things about GraphQL is that it works excellently with existing APIs. It's possible to connect any number of existing services to your schema.

The most common source is a REST API. The [`RESTDataSource`](https://www.apollographql.com/docs/apollo-server/features/data-sources.html) is a tool that integrates with `apollo-server` to simplify fetching and caching for existing REST APIs.

Other DataSources are under development, but even without the `DataSource` API, it's possible to connect any backend to a schema. [Resolvers](https://www.apollographql.com/docs/apollo-server/essentials/data.html) can do anything, including fetch data from an SDK or ORM. For more information on how to connect to different sources [read this guide](https://www.apollographql.com/docs/graphql-tools/connectors.html)

#### How do I design the schema?

Schemas should be designed with the needs of the client in mind. Rather than modeling queries and types after the underlying services, they should be designed to make querying as easy as possible. GraphQL's resolver structure makes it possible to allow this flexibility without many performance consequences. For more, read the [schema design guide](./schema-design.html).

#### How do I discover and reproduce errors?

As with any service, it's important to track errors and their causes. There are many kinds of errors that can occur with a GraphQL Schema. Some of these include service errors, where the schema can't access underlying services, and user errors, where a user enters invalid information in a query or mutation.

GraphQL is resilient to some of these errors. Since the schema is strongly typed, the designer has the ability to restrict what type of data users can enter and what type the resolvers can return. This type system catches many errors, and requires no manual checks.

For errors not prevented by the type system, it's helpful to know what exact queries were made, and with what variables. [Apollo Engine](https://www.apollographql.com/engine) is a tool that does exactly this. It can help discover and reproduce errors by showing the exact conditions in which the error occurred.

<!-- -->
<!-- -->
<!-- -->
<!-- -->
<!-- -->
<!-- -->

## Moving a feature to GraphQL

> People in this phase have decided to use GraphQL in production. They don't want to immediately refactor the APIs or apps. They want to move a single feature over to GraphQL to learn how to use it and monitor it in production.

#### How do I set up authentication/authorization for my GraphQL schema?

[TODO]()

#### How can I secure my schema from malicious or expensive queries?

[TODO]()

#### What kinds of cache should I setup?

[TODO]()

#### How can I monitor the health of my GraphQL schema?

[TODO]()

<!-- -->
<!-- -->
<!-- -->
<!-- -->
<!-- -->
<!-- -->

## Moving a product to GraphQL

> People in this phase have a good understanding of how to write, deploy, and monitor GraphQL in production. They are looking to scale GraphQL features to their entire product line.

#### How do I organize schema code to scale for a larger project?

[TODO]()

#### How can I test my client and schema?

[TODO]()

#### How can I safely make changes to the schema?

[TODO]()

<!-- -->
<!-- -->
<!-- -->
<!-- -->
<!-- -->
<!-- -->

## Standardizing GraphQL

> People in this phase are very experienced with using GraphQL and have made the decision to try to move to GraphQL as a company-wide standard. They are interested in setting up processes and guidelines to make sure other teams with less experience will be successful.

#### How should the transition to GraphQL happen?

[TODO]()

#### Who owns the idea of schema design?

[TODO]()

#### Should we enforce Node.js for schema development?

[TODO]()

#### How can I make GraphQL easier to learn?

[TODO]()
