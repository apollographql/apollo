---
title: '7. Update data with mutations'
description: Learn how to update data with the useMutation hook
---

Time to accomplish: _12 Minutes_

With Apollo Client, updating data from a graph API is as simple as calling a function. Additionally, the Apollo Client cache is smart enough to automatically update in most cases. In this section, we'll learn how to use the `useMutation` hook to login a user.

## What is the useMutation hook?

The `useMutation` hook is another important building block in an Apollo app. It leverages React's [Hooks API](https://reactjs.org/docs/hooks-intro.html) to provide a function to execute a GraphQL mutation. Additionally, it tracks the loading, completion, and error state of that mutation.

Updating data with a `useMutation` hook from `@apollo/react-hooks` is very similar to fetching data with a `useQuery` hook. The main difference is that the first value in the `useMutation` result tuple is a **mutate function** that actually triggers the mutation when it is called. The second value in the result tuple is a result object that contains loading and error state, as well as the return value from the mutation. Let's see an example:

## Update data with useMutation

The first step is defining our GraphQL mutation. To start, navigate to `src/pages/login.js` and copy the code below so we can start building out the login screen:

_src/pages/login.js_

```js
import React from 'react';
import { useApolloClient, useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';

import { LoginForm, Loading } from '../components';

const LOGIN_USER = gql`
  mutation login($email: String!) {
    login(email: $email)
  }
`;
```

Just like before, we're using the `gql` function to wrap our GraphQL mutation so it can be parsed into an AST. We're also importing some components that we'll use in the next steps. Now, let's bind this mutation to our component by passing it to the `useMutation` hook:

_src/pages/login.js_

```jsx
export default function Login() {
  const [login, { data }] = useMutation(LOGIN_USER);
  return <LoginForm login={login} />;
}
```

Our `useMutation` hook returns a mutate function (`login`) and the data object returned from the mutation that we destructure from the tuple. Finally, we pass our login function to the `LoginForm` component.

To create a better experience for our users, we want to persist the login between sessions. In order to do that, we need to save our login token to `localStorage`. Let's learn how we can use the `onCompleted` handler of `useMutation` to persist our login:

### Expose Apollo Client with useApolloClient

One of the main functions of React Apollo is that it puts your `ApolloClient` instance on React's context. Sometimes, we need to access the `ApolloClient` instance to directly call a method that isn't exposed by the `@apollo/react-hooks` helper components. The `useApolloClient` hook can help us access the client.

Let's call `useApolloClient` to get the currently configured client instance. Next, we want to pass an `onCompleted` callback to `useMutation` that will be called once the mutation is complete with its return value. This callback is where we will save the login token to `localStorage`.

In our `onCompleted` handler, we also call `client.writeData` to write local data to the Apollo cache indicating that the user is logged in. This is an example of a **direct write** that we'll explore further in the next section on local state management.

_src/pages/login.js_

```jsx{2,6-9}
export default function Login() {
  const client = useApolloClient();
  const [login, { loading, error }] = useMutation(
    LOGIN_USER,
    {
      onCompleted({ login }) {
        localStorage.setItem('token', login);
        client.writeData({ data: { isLoggedIn: true } });
      }
    }
  );

  if (loading) return <Loading />;
  if (error) return <p>An error occurred</p>;

  return <LoginForm login={login} />;
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
