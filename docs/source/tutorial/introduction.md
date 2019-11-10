---
title: 0. Introduction
description: Start here to learn how to build full-stack apps with Apollo
---

Welcome! This tutorial guides you through building a full-stack, GraphQL-powered app with the Apollo platform.

We want you to feel empowered to build your own production-ready app with Apollo, so 
we're skipping "Hello World" in favor of an example that's closer to "Real
World", complete with authentication, pagination, testing, and more. 

Ready? Let's dive in!

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

This tutorial assumes that you're familiar with both JavaScript/ES6
and React. If you need to brush up on React, we recommend going through the [official tutorial](https://reactjs.org/tutorial/tutorial.html).

> Building your frontend with React is not a requirement for using the Apollo 
> platform, but it is the primary view layer supported by Apollo.
> If you use another view layer (such as Angular or Vue), you can still 
> apply this tutorial's concepts to it.

### System requirements

Before we begin, make sure you have the following installed:

- [Node.js](https://nodejs.org/) v8.x or later
- [npm](https://www.npmjs.com/) v6.x or later
- [git](https://git-scm.com/) v2.14.1 or later

Although it isn't required, we also recommend using [VS Code](https://code.visualstudio.com/)
as your editor so you can use Apollo's helpful VS Code extension.

## Clone the example app

Now the fun begins! From your preferred development directory, clone [this repository](https://github.com/apollographql/fullstack-tutorial):

```bash
git clone https://github.com/apollographql/fullstack-tutorial.git
```

The repository contains two top-level directories: `start` and `final`. During the
tutorial you'll edit the files in `start`, and at the end they'll match the
completed app in `final`.

Each top-level directory contains two directories of its own: `server` and `client`. We'll be working in the `server` directory first. If you're already comfortable
building a graph API and you want to skip to the `client` portion, navigate to the [second half of the tutorial](/tutorial/client/).

## Need help?

Learning a new technology can be overwhelming sometimes, and it's common to get stuck! If that happens, we recommend joining the [Apollo Spectrum community](https://spectrum.chat/apollo) and posting in the relevant channel (either `#apollo-server` or `#apollo-client`) for assistance from friendly fellow developers.

If anything in the tutorial seems confusing or contains an error, we'd love your feedback! Click the **Edit on GitHub** link on the right side of the page to open a new pull request, or [open an issue on the repository](https://github.com/apollographql/apollo/issues/new).
