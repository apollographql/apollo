---
title: Apollo Docs
sidebar_title: Introduction
description: Start here to learn how to use the Apollo platform.
---

Apollo is a team and community that maintain a set of decoupled components and standards that enable developers to get the most out of GraphQL. We think GraphQL is going to be a big part of the future of application development, and want to move toward that future as quickly as possible.

The tools, products, and libraries in Apollo can be loosely grouped into 3 categories:

1. [Client](#client-section): This is a set of tools to help you consume GraphQL data in your UI, on any platform including [React](/docs/react/), [Vue](https://github.com/akryum/vue-apollo), [Angular](/docs/angular), [iOS](/docs/ios/), and [Android](https://github.com/apollographql/apollo-android).
2. [Engine](#engine): This is GraphQL infrastructure you can run over your server to get performance tracing, caching, and error tracking specifically for GraphQL.
3. [Server](#server-section): These are tools you can use to add GraphQL incrementally to your backend, or start a new GraphQL backend from scratch.

<h2 id="getting-started">Getting started</h2>

Getting started with Apollo is easy! There are some great tutorials around the internet that will take you through things step by step.

<h3 id="full-stack-graphql" title="Full stack tutorial"><a href="https://dev-blog.apollodata.com/full-stack-react-graphql-tutorial-582ac8d24e3b">Full Stack React and GraphQL Tutorial</a></h3>

In [this tutorial](https://dev-blog.apollodata.com/full-stack-react-graphql-tutorial-582ac8d24e3b), Jonas Helfer and friends take you through several small steps to build a simple GraphQL server and React app with Apollo.

<h3 id="howtographql">How to GraphQL</h3>

Nikolas Burk from Graphcool and Maira Bello from VTEX have put together two tutorials that will enable you to build a simple Hacker News clone using JavaScript. Check out the [rest of the site](https://www.howtographql.com/) for other non-JavaScript technologies!

1. [Client part with React](https://www.howtographql.com/react-apollo/0-introduction/)
2. [Server part with Node](https://www.howtographql.com/graphql-js/1-getting-started/)

<h3 id="chatty"><a href="https://medium.com/react-native-training/building-chatty-a-whatsapp-clone-with-react-native-and-apollo-part-1-setup-68a02f7e11">WhatsApp clone</a></h3>

Simon Tucker wrote [a great tutorial](https://medium.com/react-native-training/building-chatty-a-whatsapp-clone-with-react-native-and-apollo-part-1-setup-68a02f7e11) on the React Native Training blog that goes through a lot of steps to build a fully-featured chat app with realtime data.

<h2 id="client-section">Client</h2>

[Apollo Client](/client/) is the most popular solution for binding GraphQL data to your UI, on every platform. Learn more about the benefits and features on the [homepage](/client/).

<h3 id="client-libraries">GraphQL client libraries</h3>

The main parts of the project are the GraphQL client libraries for every frontend platform:

* Apollo Client JavaScript: [Docs](/docs/react/), [GitHub](https://github.com/apollographql/apollo-client)
* React and React Native: [Docs](/docs/react/), [GitHub](https://github.com/apollographql/react-apollo)
* Vue.js: [Docs, GitHub](https://github.com/akryum/vue-apollo)
* Angular: [Docs](/docs/angular/), [GitHub](https://github.com/apollographql/apollo-angular)
* Ember: [Docs, GitHub](https://github.com/bgentry/ember-apollo-client)
* Meteor: [Docs](/docs/react/recipes/meteor/), [GitHub](https://github.com/apollographql/meteor-integration)
* iOS for native Swift: [Docs](/docs/ios), [GitHub](https://github.com/apollographql/apollo-ios)
* Android for Java: [Docs, GitHub](https://github.com/apollographql/apollo-android)

If you don't see your platform here, send a PR to add it, or work on a library of your own!

<h3 id="developer-tools">Developer tooling</h3>

In addition to libraries you put in your client, there are some great tools you can use to integrate with your development environment and editor:

* GraphQL ESLint Plugin: This is a plugin you can add to ESLint to validate your GraphQL queries and see errors show up right inside your editor. [eslint-plugin-graphql on GitHub](https://github.com/apollographql/eslint-plugin-graphql)
* Apollo Codegen: You can use this tool to generate static types for your queries, for TypeScript, Flow, Java, Scala, or Swift. [apollo-codegen on GitHub](https://github.com/apollographql/apollo-codegen)
* Apollo Client Devtools: This is a Chrome dev tools panel you can use to run GraphQL queries against your server, see what queries and mutations are active in your page, and inspect the current state of the store. [Chrome Web Store](https://chrome.google.com/webstore/detail/apollo-client-developer-t/jdkknkkbebbapilgoeccciglkfbmbnfm), [GitHub](https://github.com/apollographql/apollo-client-devtools)

<h2 id="engine">Engine</h2>

Apollo Engine is turnkey infrastructure that helps you take GraphQL services into production with confidence. The successor to Apollo Optics, Engine sits between your clients and your GraphQL server, delivering essential capabilities like query caching, error tracking, and execution tracing on top of any spec-compliant GraphQL server including Apollo Server, GraphQL-Ruby, Sangria, and Absinthe.

* [Learn about Engine features](/engine/)
* [Get started with Engine](https://engine.apollographql.com)
* [Read the Engine docs](/docs/engine/)

<h2 id="client-section">Server</h2>

You need a GraphQL server to be able to access your data via GraphQL. While we have some server libraries and tools for JavaScript, you can also write a GraphQL server in any other language.

[Read more about GraphQL servers.](/servers/)

<h3 id="server-libraries">Apollo server libraries</h3>

The Apollo server libraries for JavaScript are designed to make it simple to add GraphQL on top of your existing backends, or build a new server from scratch. They are built around [GraphQL.js](https://github.com/graphql/graphql-js), Facebook's reference GraphQL implementation for JavaScript.

* GraphQL Tools: This library helps you easily generate a GraphQL schema using the GraphQL schema language and resolvers. It also supports additional features like mocking, schema stitching, and more. [Docs](/docs/graphql-tools), [GitHub](https://github.com/apollographql/graphql-tools)
* Apollo Server: This is a library for attaching a GraphQL schema to a server endpoint, which supports all major Node.js server technologies including Express, Hapi, Koa, and more. [Docs](/docs/apollo-server/), [GitHub](https://github.com/apollographql/apollo-server)
* GraphQL Subscriptions: Add realtime data streaming capabilities to your GraphQL server. [Docs](/docs/graphql-subscriptions), [GitHub](https://github.com/apollographql/subscriptions-transport-ws)

<h2 id="specifications">Specifications</h2>

The GraphQL specification is the only thing you need to use all of the Apollo tools. Thankfully, the core spec has extension points so you can add useful new functionality.

* Apollo Tracing: A spec for adding performance tracing data to your GraphQL response. [Docs, GitHub](https://github.com/apollographql/apollo-tracing)
* Apollo Cache Control: A spec for adding performance tracing data to your GraphQL response. [Docs, GitHub](https://github.com/apollographql/apollo-cache-control)
