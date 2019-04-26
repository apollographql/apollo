---
title: "5. Connect your API to a client"
description: Hook up your graph to Apollo Client
---

Time to accomplish: _10 Minutes_

The next half of this tutorial exclusively focuses on connecting a graph API to a frontend with Apollo Client. **Apollo Client** is a complete data management solution for any client. It's view-layer agnostic, which means it can integrate with React, Vue, Angular, or even vanilla JS. Thanks to its intelligent cache, Apollo Client offers a single source of truth for all of the local and remote data in your application.

While Apollo Client works with any view layer, it's most commonly used with React. In this section, you'll learn how to connect the graph API you just built in the previous half of this tutorial to a React app. Even if you're more comfortable with Vue or Angular, you should still be able to follow many of the examples since the concepts are the same. Along the way, you'll also learn how to build essential features like authentication and pagination, as well as tips for optimizing your workflow.

## Set up your development environment

For this half of the tutorial, we will be working in the `client/` folder of the project. You should have the project already from the server portioned, but if you don't, make sure to clone [the tutorial](https://github.com/apollographql/fullstack-tutorial/). From the root of the project, run:

```bash
cd start/client && npm install
```

Now, our dependencies are installed. Here are the packages we will be using to build out our frontend:

- `apollo-client`: A complete data management solution with an intelligent cache. In this tutorial, we will be using the Apollo Client 3.0 preview since it includes local state management capabilities and sets your cache up for you.
- `react-apollo`: The view layer integration for React that exports components such as `Query` and `Mutation`
- `graphql-tag`: The tag function `gql` that we use to wrap our query strings in order to parse them into an AST

### Configure Apollo VSCode

While Apollo VSCode is not required to successfully complete the tutorial, setting it up unlocks a lot of helpful features such as autocomplete for operations, jump to fragment definitions, and more.

First, make a copy of the `.env.example` file located in `client/` and call it `.env`. Add your Engine API key that you already created in step #4 to the file:

```
ENGINE_API_KEY=service:<your-service-name>:<hash-from-apollo-engine>
```

The entry should basically look something like this:

```
ENGINE_API_KEY=service:my-service-439:E4VSTiXeFWaSSBgFWXOiSA
```

Our key is now stored under the environment variable `ENGINE_API_KEY`. Apollo VSCode uses this API key to pull down your schema from the registry.

Next, create an Apollo config file called `apollo.config.js`. This config file is how you configure both the Apollo VSCode extension and CLI. Paste the snippet below into the file:

```js
module.exports = {
  client: {
    name: 'Space Explorer [web]',
    service: 'space-explorer',
  },
};
```

Great, we're all set up! Let's dive into building our first client.

## Create an Apollo Client

Now that we have installed the necessary packages, let's create an `ApolloClient` instance.

Navigate to `src/index.js` so we can create our client. The `uri` that we pass in is the graph endpoint from the service you deployed in step 4.

If you didn't complete the server portion, you can use the `uri` from the code below. Otherwise, use your own deployment's URL, which may be different than the one below. Navigate to `src/index.js` and copy the code below:

_src/index.js_

```js
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';

const cache = new InMemoryCache();
const link = new HttpLink({
  uri: 'http://localhost:4000/'
})

const client = new ApolloClient({
  cache,
  link
})
```

In just a few lines of code, our client is ready to fetch data! Let's try making a query in the next section.

## Make your first query

Before we show you how to use the React integration for Apollo, let's send a query with vanilla JavaScript.

With a `client.query()` call, we can query our graph's API. Add the following line of code to your imports in `src/index.js`.

_src/index.js_

```js
import gql from "graphql-tag"; // highlight-line
```

And add this code to the bottom of `index.js`:

_src/index.js_

```js
// ... above is the instantiation of the client object.
client
  .query({
    query: gql`
      query GetLaunch {
        launch(id: 56) {
          id
          mission {
            name
          }
        }
      }
    `
  })
  .then(result => console.log(result));
```

Open up your console and run `npm start`. This will compile your client app. Once it is finished, your browser should open to `http://localhost:3000/` automatically. When the index page opens, open up your [Developer Tools console](https://developers.google.com/web/tools/chrome-devtools/console/) and you should see an object with a `data` property containing the result of our query. You'll also see some other properties, like `loading` and `networkStatus`. This is because Apollo Client tracks the loading state of your query for you.

Apollo Client is designed to fetch graph data from any JavaScript frontend. No frameworks needed. However, there are view layer integrations for different frameworks that makes it easier to bind queries to the UI.

Go ahead and delete the `client.query()` call you just made and the `gql` import statement. Now, we'll connect our client to React.

## Connect your client to React

Connecting Apollo Client to our React app with `react-apollo` allows us to easily bind GraphQL operations to our UI.

To connect Apollo Client to React, we will wrap our app in the `ApolloProvider` component exported from the `react-apollo` package and pass our client to the `client` prop. The `ApolloProvider` component is similar to React’s context provider. It wraps your React app and places the client on the context, which allows you to access it from anywhere in your component tree.

Open `src/index.js` and add the following lines of code:

_src/index.js_

```jsx{1,4,6}
import { ApolloProvider } from 'react-apollo';
import React from 'react';
import ReactDOM from 'react-dom';
import Pages from './pages';

// previous variable declarations

ReactDOM.render(
  <ApolloProvider client={client}>
    <Pages />
  </ApolloProvider>, document.getElementById('root')
);
```

Now, we're ready to start building our first `Query` components in the next section.
