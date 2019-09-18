---
title: 0. Introduction
description: Start here to learn how to build full-stack apps with Apollo
---

Welcome! This tutorial guides you through building a full-stack, GraphQL-powered app with the Apollo platform.

We want you to feel empowered to build your own production-ready app with Apollo, so 
we're skipping "Hello World" in favor of an example that's closer to a
real-world app, complete with authentication, pagination, testing, and more. 

Ready? Let's dive in!

## What is Apollo?

Apollo is a complete platform for implementing a **data graph**. The platform 
includes two open-source libraries, **Apollo Server** and **Apollo Client**, that 
together help you build and query your data graph. It also includes a cloud
service, **Apollo Graph Manager**, that gives you full visibility into the performance and security of your data graph.

[GraphQL](https://www.graphql.org/) is the specification that our app's data graph
will use to move data between our front-end UI and back-end services. The GraphQL
specification is language-agnostic and unopinionated, and the Apollo platform 
provides an _implementation_ of that specification.

### Why do you need a data graph?

One of the hardest parts of building a modern app is figuring out your data layer.
You often need to fetch data from multiple back-end services and deliver it to
distinct clients across multiple platforms. By layering a data graph between your 
back-end services and your front-end UI, you can remove complexity from your 
data-fetching logic and ship features faster:

<div style="text-align:center">
  <img src="../images/graph-layer.png" alt="Graph layer">
</div>

## What we'll build

In this tutorial, we'll build an interactive app for reserving a seat on an upcoming SpaceX launch. Think of it as an Airbnb for space travel! All of the data is real, thanks to the [SpaceX-API](https://github.com/r-spacex/SpaceX-API).

Here's what the finished app will look like:

<div style="text-align:center">
  <img src="../images/space-explorer.png" alt="Space explorer" width="400">
</div>

The app includes the following views:

* A login page
* A list of upcoming launches
* A detail view for an individual launch
* A user profile page
* A cart

To populate these views, our app's data graph will connect to two data sources: 
a REST API and a SQLite database. (Don't worry, you don't need to be familiar with
either of those technologies to complete the tutorial.)

As mentioned, we want this example to resemble a real-world Apollo app, so we'll
also add common useful features like authentication, pagination, and state
management.

## Prerequisites

The tutorial assumes that you have a basic familiarity with both JavaScript/ES6
and React. If you need to brush up on React, we recommend going through the [official tutorial](https://reactjs.org/tutorial/tutorial.html).

> Building your frontend with React is not a requirement for using the Apollo 
> platform, but it is the primary view layer supported by Apollo.
> If you use another view layer (such as Angular or Vue), you can still 
> apply this tutorial's concepts to it.

### System requirements

Before we begin, make sure you have the following installed:

- [Node.js](https://nodejs.org/) v8.x or greater
- [npm](https://www.npmjs.com/) v6.x or greater
- [git](https://git-scm.com/) v2.14.1 or greater

Although it isn't required, we also recommend using [VS Code](https://code.visualstudio.com/)
as your editor so you can use Apollo's helpful VS Code extension.

## Set up your development environment

Now the fun begins! First, you'll need to install our developer tools:

- [Apollo Graph Manager (required)](https://engine.apollographql.com) : Our cloud service where you'll register and manage your graph API.
- [Apollo DevTools for Chrome (suggested)](https://chrome.google.com/webstore/detail/apollo-client-developer-t/jdkknkkbebbapilgoeccciglkfbmbnfm) : Our Chrome extension giving you full visibility into your client.
- [Apollo VSCode (suggested)](https://marketplace.visualstudio.com/items?itemName=apollographql.vscode-apollo): Our editor integration that offers intelligent autocomplete, metrics, and more.

Next, in your terminal, clone [this repository](https://github.com/apollographql/fullstack-tutorial):

```bash
git clone https://github.com/apollographql/fullstack-tutorial/
```

There are two folders: one for the starting point (`start`) and one for the final version (`final`). Within each directory are two folders: one for the server and one for the client. We will be working in the server folder first. If you're comfortable with building a graph API already and you want to skip to the client portion, navigate to the [last half of the tutorial](/tutorial/client/).

<!--
TODO: Add in this section after Apollo VSCode works for server development
### Configure Apollo VSCode -->

### Where can I get help?

We know that learning a new technology can sometimes be overwhelming, and it's totally normal to get stuck! If that happens, we recommend joining the [Apollo Spectrum](https://spectrum.chat/apollo) community and posting in the relevant channel (either #apollo-server or #apollo-client) for some quick answers.

If something in the tutorial seems confusing or contains an error, we'd love your feedback! Just click the Edit on GitHub link on the right side of the page to open a new pull request or open an issue on the repository.
