---
title: "5. Connect your API to a client"
description: Connect your graph API to a React frontend
---

The next step after building your graph API is to fetch the data from the API and present on a client. In this section, you'll learn how to build a React UI that consumes our graph API's data with Apollo.

<h2 id="dev-environment">Set up your development environment</h2>

First, let's install two packages:

```bash
npm install react-apollo graphql graphql-tag --save
```

**react-apollo** is a view layer React integration for Apollo Client.

**Apollo Client** is a JavaScript production-ready client that helps you quickly build a UI that fetches your graph's data and manages state efficiently. It supports esssential features like caching, pagination, and code splitting.

<h2 id="apollo-client-setup">Create an Apollo Client</h2>

Now that we have installed the necessary packages, let's create an Apollo Client.

Apollo Client needs to connect to the endpoint of our graph API. If no URL is passed to Apollo Client, it falls back to the `/graphql` endpoint on the same host your app is served from.

Navigate to `src/index.js` so we can create our client. Copy the code below into the file.

_src/index.js_

```js
import { ApolloClient } from "apollo-client";

const client = new ApolloClient({
  uri: "http://localhost:4000/graphql"
});
```
**Note:** The `src` directory mentioned here is not the server directory. It's a new directory that contains the client code.

To connect our graph API to a client, we need to import the `ApolloClient` class from `apollo-client` and pass our API URL to the client via the `uri` property of the client config object.

Now, let's fetch data with Apollo Client.

<h2 id="apollo-client-setup">Make your first query</h2>

Our client is ready to start fetching data. Let's send a query with vanilla JavaScript.

With a `client.query()` call, we can query our graph's API. Copy the code below and add it to `src/index.js`.

_src/index.js_

```js
...
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import gql from "graphql-tag";

const cache = new InMemoryCache();
const client = new ApolloClient({
  cache,
  link: new HttpLink({
    uri: "https://fullstack-tutorial-server-xsftsvrjdj.now.sh/graphql"
  })
});

client
  .query({
    query: gql`
      {
        launch(id: 56) {
          year
          mission {
            name
          }
        }
      }
    `
  })
  .then(result => console.log(result));

```

**Note:** The `apollo-cache-inmemory` and `apollo-link-http` packages are vital to developing with Apollo Client so make sure they are installed. Run `npm install apollo-cache-inmemory apollo-link-http --save`. The `apollo-link-http` package handles network requests for fetching remote data, while the `apollo-cache-inmemory` package handes caching.

The `gql` tag is a JavaScript template literal tag that enables syntax highlighting for our schema, and also parses the query into an abstract sytax tree. The tree is sent to the client via the `client.query()` call.

The result of the query should be an object with a `data` property. The launch returned is attached to the `data` property. You can check out the [codesandbox demo of the code above.](https://codesandbox.io/s/8xmn5j6n88)

Apollo Client is designed to enable fetching of graph data by any JavaScript frontend. No frameworks needed. However, there are view layer integrations for different frameworks that makes it easier to bind queries to UI.

Now, let's connect our client to React.

<h2 id="react-apollo">Connect your client to React</h2>

React is the choice of framework for our UI frontend in this tutorial.

Install React using `create-react-app` via `npx`:

```bash
npx create-react-app frontend
```

Now, let's connect Apollo Client to our React app.

To connect Apollo Client to React, you will need to invoke the `ApolloProvider` component exported from the `react-apollo` package. The `ApolloProvider` component is similar to React’s context provider. It wraps your React app and places the client on the context, which allows you to access it from anywhere in your component tree.

Open `src/index.js` and the update the code to be:

_src/index.js_

```js
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import { ApolloClient } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>, document.getElementById('root'));
```

**Note:** Delete all the service worker code that React provides out of the box. We don't need them for this app.