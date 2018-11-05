---
title: "8. Manage local state"
description: How to store and query local data in the Apollo cache
---

In almost every app we build, we display a combination of remote data from our graph API and local data such as network status, form state, and more. What's awesome about Apollo Client is that it allows us to store local data inside the Apollo cache and query it alongside our remote data with GraphQL.

We recommend managing local state in the Apollo cache instead of bringing in another state management library like Redux. The advantage of managing state this way is that the Apollo cache becomes the single source of truth for all data in our app and we don't have to synchronize our remote data with an external store.

Managing local data with Apollo Client is very similar to how you've already managed remote data in this tutorial. You'll write a client schema and resolvers for your local data. You'll also learn to query it with GraphQL just by specifying the `@client` directive. Let's dive in!

<h2 id="local-schema">Write a local schema</h2>

Just like how a schema is the first step toward defining our data model on the server, writing a local schema is the first step we take on the client.

Navigate to `src/resolvers.js` and copy the following code to create your client schema:

_src/resolvers.js_

```js
import gql from 'graphql-tag';

export const schema = gql`
  extend type Query {
    isLoggedIn: Boolean!
    cartItems: [Launch]!
  }

  extend type Launch {
    isInCart: Boolean!
  }

  extend type Mutation {
    addOrRemoveFromCart: [Launch]
  }
`;
```

To build a client schema, we **extend** the types of our server schema and wrap it with the `gql` function. Using the extend keyword allows us to combine both schemas inside developer tooling like Apollo VSCode and Apollo DevTools.

We can also add local fields to server data by extending types from our server. Here, we're adding the `isInCart` local field to the `Launch` type we receive back from our graph API.

<h2 id="store-initializers">Initialize the store</h2>

Now that we've created our client schema, let's learn how to initialize the store. Since queries execute as soon as the component mounts, it's important for us to warm the Apollo cache with some default state so those queries don't error out. We will need to create `storeInitializers` for both `isLoggedIn` and `cartItems` to prevent these two local queries from erroring out:

Jump to `src/index.js` and specify your `storeInitializers` on the `ApolloClient` constructor:

_src/index.js_

```js lines=9-12
const client = new ApolloClient({
  cache,
  link: new HttpLink({
    uri: 'http://localhost:4000/graphql',
    headers: {
      authorization: localStorage.getItem('token'),
    },
  }),
  storeInitializers: {
    isLoggedIn: () => !!localStorage.getItem('token'),
    cartItems: () => [],
  },
});
```

These `storeInitializers` will be called as soon as `ApolloClient` is created. They will also run if the user resets the cache.

Now that we've added default state to the Apollo cache, let's learn how we will query local data from within our React components.

<h2 id="local-query">Query local data</h2>

<h2 id="local-mutation">Update local data</h2>

<h2 id="cart">Build a cart</h2>
