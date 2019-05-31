---
title: '8. Manage local state'
description: How to store and query local data in the Apollo cache
---

Time to accomplish: _15 Minutes_

In almost every app we build, we display a combination of remote data from our graph API and local data such as network status, form state, and more. What's awesome about Apollo Client is that it allows us to store local data inside the Apollo cache and query it alongside our remote data with GraphQL.

We recommend managing local state in the Apollo cache instead of bringing in another state management library like Redux so the Apollo cache can be a single source of truth.

Managing local data with Apollo Client is very similar to how you've already managed remote data in this tutorial. You'll write a client schema and resolvers for your local data. You'll also learn to query it with GraphQL just by specifying the `@client` directive. Let's dive in!

### Write a local schema

Just like how a schema is the first step toward defining our data model on the server, writing a local schema is the first step we take on the client.

Navigate to `src/resolvers.js` and copy the following code to create your client schema (as well as blank client resolvers for later):

_src/resolvers.js_

```js
import gql from 'graphql-tag';

export const typeDefs = gql`
  extend type Query {
    isLoggedIn: Boolean!
    cartItems: [ID!]!
  }

  extend type Launch {
    isInCart: Boolean!
  }

  extend type Mutation {
    addOrRemoveFromCart(id: ID!): [Launch]
  }
`;

export const resolvers = {};
```

To build a client schema, we **extend** the types of our server schema and wrap it with the `gql` function. Using the extend keyword allows us to combine both schemas inside developer tooling like Apollo VSCode and Apollo DevTools.

We can also add local fields to server data by extending types from our server. Here, we're adding the `isInCart` local field to the `Launch` type we receive back from our graph API.

## Initialize the store

Now that we've created our client schema, let's learn how to initialize the store. Since queries execute as soon as the component mounts, it's important for us to warm the Apollo cache with some default state so those queries don't error out. We will need to write initial data to the cache for both `isLoggedIn` and `cartItems`:

Jump back to `src/index.js` and notice we had already added a `cache.writeData` call to prepare the cache in the last section. While we're here, make sure to also import the `typeDefs` and `resolvers` that we just created so we can use them later:

_src/index.js_

```js{1,11-12,15-20}
import { resolvers, typeDefs } from './resolvers';

const client = new ApolloClient({
  cache,
  link: new HttpLink({
    uri: 'http://localhost:4000/graphql',
    headers: {
      authorization: localStorage.getItem('token'),
    },
  }),
  typeDefs,
  resolvers,
});

cache.writeData({
  data: {
    isLoggedIn: !!localStorage.getItem('token'),
    cartItems: [],
  },
});
```

Now that we've added default state to the Apollo cache, let's learn how to query local data from within our React components.

## Query local data

Querying local data from the Apollo cache is almost the same as querying remote data from a graph API. The only difference is that you add a `@client` directive to a local field to tell Apollo Client to pull it from the cache.

Let's look at an example where we query the `isLoggedIn` field we wrote to the cache in the last mutation exercise.

_src/index.js_

```jsx{8,17-19}
import { Query, ApolloProvider } from 'react-apollo';
import gql from 'graphql-tag';

import Pages from './pages';
import Login from './pages/login';
import injectStyles from './styles';

const IS_LOGGED_IN = gql`
  query IsUserLoggedIn {
    isLoggedIn @client
  }
`;

injectStyles();
ReactDOM.render(
  <ApolloProvider client={client}>
    <Query query={IS_LOGGED_IN}>
      {({ data }) => (data.isLoggedIn ? <Pages /> : <Login />)}
    </Query>
  </ApolloProvider>,
  document.getElementById('root'),
);
```

First, we create our `IsUserLoggedIn` local query by adding the `@client` directive to the `isLoggedIn` field. Then, we render a `Query` component, pass our local query in, and specify a render prop function that renders either a login screen or the homepage depending if the user is logged in. Since cache reads are synchronous, we don't have to account for any loading state.

Let's look at another example of a component that queries local state in `src/pages/cart.js`. Just like before, we create our query:

_src/pages/cart.js_

```js
import React, { Fragment } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { Header, Loading } from '../components';
import { CartItem, BookTrips } from '../containers';

export const GET_CART_ITEMS = gql`
  query GetCartItems {
    cartItems @client
  }
`;
```

Next, we render our `Query` component and bind it to our `GetCartItems` query:

_src/pages/cart.js_

```jsx
export default function Cart() {
  return (
    <Query query={GET_CART_ITEMS}>
      {({ data, loading, error }) => {
        if (loading) return <Loading />;
        if (error) return <p>ERROR: {error.message}</p>;
        return (
          <Fragment>
            <Header>My Cart</Header>
            {!data.cartItems || !data.cartItems.length ? (
              <p data-testid="empty-message">No items in your cart</p>
            ) : (
              <Fragment>
                {data.cartItems.map(launchId => (
                  <CartItem key={launchId} launchId={launchId} />
                ))}
                <BookTrips cartItems={data.cartItems} />
              </Fragment>
            )}
          </Fragment>
        );
      }}
    </Query>
  );
}
```

It's important to note that you can mix local queries with remote queries in a single GraphQL document. Now that you're a pro at querying local data with GraphQL, let's learn how to add local fields to server data.

### Adding virtual fields to server data

One of the unique advantages of managing your local data with Apollo Client is that you can add **virtual fields** to data you receive back from your graph API. These fields only exist on the client and are useful for decorating server data with local state. In our example, we're going to add an `isInCart` virtual field to our `Launch` type.

To add a virtual field, first extend the type of the data you're adding the field to in your client schema. Here, we're extending the `Launch` type:

_src/resolvers.js_

```js
import gql from 'graphql-tag';

export const schema = gql`
  extend type Launch {
    isInCart: Boolean!
  }
`;
```

Next, specify a client resolver on the `Launch` type to tell Apollo Client how to resolve your virtual field:

_src/resolvers.js_

```js
export const resolvers = {
  Launch: {
    isInCart: (launch, _, { cache }) => {
      const { cartItems } = cache.readQuery({ query: GET_CART_ITEMS });
      return cartItems.includes(launch.id);
    },
  },
};
```

We're going to learn more about client resolvers in the section below. The important thing to note is that the resolver API on the client is the same as the resolver API on the server.

Now, you're ready to query your virtual field on the launch detail page! Similar to the previous examples, just add your virtual field to a query and specify the `@client` directive.

_src/pages/launch.js_

```js{4}
export const GET_LAUNCH_DETAILS = gql`
  query LaunchDetails($launchId: ID!) {
    launch(id: $launchId) {
      isInCart @client
      site
      rocket {
        type
      }
      ...LaunchTile
    }
  }
  ${LAUNCH_TILE_DATA}
`;
```

## Update local data

Up until now, we've focused on querying local data from the Apollo cache. Apollo Client also lets you update local data in the cache with either **direct cache writes** or **client resolvers**. Direct writes are typically used to write simple booleans or strings to the cache whereas client resolvers are for more complicated writes such as adding or removing data from a list.

### Direct cache writes

Direct cache writes are convenient when you want to write a simple field, like a boolean or a string, to the Apollo cache. We perform a direct write by calling `client.writeData()` and passing in an object with a data property that corresponds to the data we want to write to the cache. We've already seen an example of a direct write, when we called `client.writeData` in the `onCompleted` handler for the login `Mutation` component. Let's look at a similar example, where we copy the code below to create a logout button:

_src/containers/logout-button.js_

```jsx
import React from 'react';
import styled from 'react-emotion';
import { ApolloConsumer } from 'react-apollo';

import { menuItemClassName } from '../components/menu-item';
import { ReactComponent as ExitIcon } from '../assets/icons/exit.svg';

export default function LogoutButton() {
  return (
    <ApolloConsumer>
      {client => (
        <StyledButton
          onClick={() => {
            client.writeData({ data: { isLoggedIn: false } }); // highlight-line
            localStorage.clear();
          }}
        >
          <ExitIcon />
          Logout
        </StyledButton>
      )}
    </ApolloConsumer>
  );
}

const StyledButton = styled('button')(menuItemClassName, {
  background: 'none',
  border: 'none',
  padding: 0,
});
```

When we click the button, we perform a direct cache write by calling `client.writeData` and passing in a data object that sets the `isLoggedIn` boolean to false.

We can also perform direct writes within the `update` function of a `Mutation` component. The `update` function allows us to manually update the cache after a mutation occurs without refetching data. Let's look at an example in `src/containers/book-trips.js`:

_src/containers/book-trips.js_

```jsx{30-32}
import React from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import Button from '../components/button';
import { GET_LAUNCH } from './cart-item';

const BOOK_TRIPS = gql`
  mutation BookTrips($launchIds: [ID]!) {
    bookTrips(launchIds: $launchIds) {
      success
      message
      launches {
        id
        isBooked
      }
    }
  }
`;

export default function BookTrips({ cartItems }) {
  return (
    <Mutation
      mutation={BOOK_TRIPS}
      variables={{ launchIds: cartItems }}
      refetchQueries={cartItems.map(launchId => ({
        query: GET_LAUNCH,
        variables: { launchId },
      }))}
      update={cache => {
        cache.writeData({ data: { cartItems: [] } });
      }}
    >
      {(bookTrips, { data, loading, error }) =>
        data && data.bookTrips && !data.bookTrips.success ? (
          <p data-testid="message">{data.bookTrips.message}</p>
        ) : (
          <Button onClick={bookTrips} data-testid="book-button">
            Book All
          </Button>
        )
      }
    </Mutation>
  );
}
```

In this example, we're directly calling `cache.writeData` to reset the state of the `cartItems` after the `BookTrips` mutation is sent to the server. This direct write is performed inside of the update function, which is passed our Apollo Client instance.

### Local resolvers

We're not done yet! What if we wanted to perform a more complicated local data update such as adding or removing items from a list? For this situation, we'll use a local resolver. Local resolvers have the same function signature as remote resolvers (`(parent, args, context, info) => data`). The only difference is that the Apollo cache is already added to the context for you. Inside your resolver, you'll use the cache to read and write data.

Let's write the local resolver for the `addOrRemoveFromCart` mutation. You should place this resolver underneath the `Launch` resolver we wrote earlier.

_src/resolvers.js_

```js
export const resolvers = {
  Mutation: {
    addOrRemoveFromCart: (_, { id }, { cache }) => {
      const { cartItems } = cache.readQuery({ query: GET_CART_ITEMS });
      const data = {
        cartItems: cartItems.includes(id)
          ? cartItems.filter(i => i !== id)
          : [...cartItems, id],
      };
      cache.writeQuery({ query: GET_CART_ITEMS, data });
      return data.cartItems;
    },
  },
};
```

In this resolver, we destructure the Apollo `cache` from the context in order to read the query that fetches cart items. Once we have our cart data, we either remove or add the cart item's `id` passed into the mutation to the list. Finally, we return the updated list from the mutation.

Let's see how we call the `addOrRemoveFromCart` mutation in a component:

_src/containers/action-button.js_

```js
import gql from 'graphql-tag';

const TOGGLE_CART = gql`
  mutation addOrRemoveFromCart($launchId: ID!) {
    addOrRemoveFromCart(id: $launchId) @client
  }
`;
```

Just like before, the only thing we need to add to our mutation is a `@client` directive to tell Apollo to resolve this mutation from the cache instead of a remote server.

Now that our local mutation is complete, let's build out the rest of the `ActionButton` component so we can finish building the cart:

_src/containers/action-button.js_

```jsx
import React from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import { GET_LAUNCH_DETAILS } from '../pages/launch';
import Button from '../components/button';

const CANCEL_TRIP = gql`
  mutation cancel($launchId: ID!) {
    cancelTrip(launchId: $launchId) {
      success
      message
      launches {
        id
        isBooked
      }
    }
  }
`;

export default function ActionButton({ isBooked, id, isInCart }) {
  return (
    <Mutation
      mutation={isBooked ? CANCEL_TRIP : TOGGLE_CART}
      variables={{ launchId: id }}
      refetchQueries={[
        {
          query: GET_LAUNCH_DETAILS,
          variables: { launchId: id },
        },
      ]}
    >
      {(mutate, { loading, error }) => {
        if (loading) return <p>Loading...</p>;
        if (error) return <p>An error occurred</p>;

        return (
          <div>
            <Button
              onClick={mutate}
              isBooked={isBooked}
              data-testid={'action-button'}
            >
              {isBooked
                ? 'Cancel This Trip'
                : isInCart
                ? 'Remove from Cart'
                : 'Add to Cart'}
            </Button>
          </div>
        );
      }}
    </Mutation>
  );
}
```

In this example, we're using the `isBooked` prop passed into the component to determine which mutation we should fire. Just like remote mutations, we can pass in our local mutations to the same `Mutation` component.

---

Congratulations! 🎉 You've officially made it to the end of the Apollo platform tutorial. In the final section, we're going to recap what we just learned and give you guidance on what you should learn next.
