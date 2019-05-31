---
title: '7. Update data with mutations'
description: Learn how to update data with the Mutation component
---

Time to accomplish: _12 Minutes_

With Apollo Client, updating data from a graph API is as simple as calling a function. Additionally, the Apollo Client cache is smart enough to automatically update in most cases. In this section, we'll learn how to use the `Mutation` component from `react-apollo` to login a user.

## What is a Mutation component?

The `Mutation` component is another important building block in an Apollo app. It's a React component that provides a function to execute a GraphQL mutation. Additionally, it tracks the loading, completion, and error state of that mutation.

Updating data with a `Mutation` component from `react-apollo` is very similar to fetching data with a `Query` component. The main difference is that the first argument to the `Mutation` render prop function is a **mutate function** that actually triggers the mutation when it is called. The second argument to the `Mutation` render prop function is a result object that contains loading and error state, as well as the return value from the mutation. Let's see an example:

## Update data with Mutation

The first step is defining our GraphQL mutation. To start, navigate to `src/pages/login.js` and copy the code below so we can start building out the login screen:

_src/pages/login.js_

```js
import React from 'react';
import { Mutation, ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';

import { LoginForm, Loading } from '../components';

const LOGIN_USER = gql`
  mutation login($email: String!) {
    login(email: $email)
  }
`;
```

Just like before, we're using the `gql` function to wrap our GraphQL mutation so it can be parsed into an AST. We're also importing some components that we'll use in the next steps. Now, let's bind this mutation to our component by passing it to the `mutation` prop:

_src/pages/login.js_

```jsx
export default function Login() {
  return (
    <Mutation mutation={LOGIN_USER}>
      {(login, { data }) => <LoginForm login={login} />}
    </Mutation>
  );
}
```

Our `Mutation` component takes a render prop function as a child that exposes a mutate function (`login`) and the data object returned from the mutation. Finally, we pass our login function to the `LoginForm` component.

To create a better experience for our users, we want to persist the login between sessions. In order to do that, we need to save our login token to `localStorage`. Let's learn how we can use the `onCompleted` handler on `Mutation` to persist our login:

### Expose Apollo Client with ApolloConsumer

One of the main functions of `react-apollo` is that it puts your `ApolloClient` instance on React's context. Sometimes, we need to access the `ApolloClient` instance to directly call a method that isn't exposed by the `react-apollo` helper components. The `ApolloConsumer` component can help us access the client.

`ApolloConsumer` takes a render prop function as a child that is called with the client instance. Let's wrap our `Mutation` component with `ApolloConsumer` to expose the client. Next, we want to pass an `onCompleted` callback to `Mutation` that will be called once the mutation is complete with its return value. This callback is where we will save the login token to `localStorage`.

In our `onCompleted` handler, we also call `client.writeData` to write local data to the Apollo cache indicating that the user is logged in. This is an example of a **direct write** that we'll explore further in the next section on local state management.

_src/pages/login.js_

```jsx{3,4,7-10,22}
export default function Login() {
  return (
    <ApolloConsumer>
      {client => (
        <Mutation
          mutation={LOGIN_USER}
          onCompleted={({ login }) => {
            localStorage.setItem('token', login);
            client.writeData({ data: { isLoggedIn: true } });
          }}
        >
          {(login, { loading, error }) => {
            // this loading state will probably never show, but it's helpful to
            // have for testing
            if (loading) return <Loading />;
            if (error) return <p>An error occurred</p>;

            return <LoginForm login={login} />;
          }}
        </Mutation>
      )}
    </ApolloConsumer>
  );
}
```

### Attach authorization headers to the request

We're almost done completing our login feature! Before we do, we need to attach our token to the GraphQL request's headers so our server can authorize the user. To do this, navigate to `src/index.js` where we create our `ApolloClient` and replace the code below for the constructor:

_src/index.js_

```js
const client = new ApolloClient({
  cache,
  link: new HttpLink({
    uri: 'http://localhost:4000/graphql',
    headers: { // highlight-line
      authorization: localStorage.getItem('token'), // highlight-line
    },
  }),
});

cache.writeData({
  data: {
    isLoggedIn: !!localStorage.getItem('token'),
    cartItems: [],
  },
});
```

Specifying the `headers` option on `HttpLink` allows us to read the token from `localStorage` and attach it to the request's headers each time a GraphQL operation is made.

In the next section, we'll add the `<Login>` form to the user interface. For that, we need to learn how Apollo allows us to manage local state in our app.
