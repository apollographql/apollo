---
title: "7. Update data with mutations"
description: Learn how to update data with Mutation components
---

Now that we've learned how to fetch data with the Query component, how do we update the data?

In this section, you'll learn how to send updates from the client to your graph API with Apollo `Mutation` component. Furthermore, you'll learn how to update the Apollo cache and handle errors on the client.

<h2 id="query-component">What is a Mutation component?</h2>

The Apollo `Mutation` component is a React component that we use to handle mutations in our UI. To effectively trigger mutations from our client UI, we'll have to pass a mutation string to the `mutation` prop of the `Mutation` component.

The `Mutation` component also uses the render prop pattern where a mutate function is passed to the child function. The `loading`, `error`, and `data` properties provided by the `Query` component are also made available by the `Mutation` component.

Navigate to `src/pages` directory and create a `launch.js` file. Copy the code below and add to it. This page contains details about a specific launch and has a button that can be clicked on to add the launch to a cart.

_src/pages/launch.js_

```js
import React from 'react';
import styled from 'react-emotion';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import PageContainer from '../components/page-container';

const ADD_TO_CART_MUTATION = gql`
  mutation addToCart($launchId: ID!) {
    addToCart(id: $launchId) @client
  }
`;

const LAUNCH_DETAILS_QUERY = gql`
  query LaunchDetails($launchId: ID!) {
    launch(id: $launchId) {
      year
      mission {
        name
        missionPatch
      }
      rocket {
        id
        name
        type
      }
      launchSuccess
      isBooked
    }
  }
`;

// the launchId prop here comes from the router
export default ({ launchId }) => {
  return (
    <PageContainer>
      <Query query={LAUNCH_DETAILS_QUERY} variables={{ launchId }}>
        {({ data, loading, error }) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <p>ERROR: {error.message}</p>;

          const {
            mission,
            rocket,
            launchSuccess,
            isBooked,
            year,
          } = data.launch;

          return (
            <div style={{ width: '100%', justifyContent: 'center' }}>
              <img
                src={mission.missionPatch}
                style={{ width: '200px' }}
                alt={`Mission patch for ${mission.name}`}
              />
              <h2>{mission.name}</h2>
              <p>{year}</p>

              <h3>Rocket</h3>
              <p>
                <strong>Name:</strong> {rocket.name}
              </p>
              <p>
                <strong>Type:</strong> {rocket.type}
              </p>

              <hr />
              <Mutation
                mutation={ADD_TO_CART_MUTATION}
                variables={{ launchId }}
              >
                {(addToCart, { data, loading, error }) => {
                  return (
                    <BookButton onClick={addToCart}>
                      {isBooked ? 'Cancel This Trip' : 'Add to Cart'}
                    </BookButton>
                  );
                }}
              </Mutation>
            </div>
          );
        }}
      </Query>
    </PageContainer>
  );
};

/**
 * STYLED COMPONENTS USED IN THIS FILE ARE BELOW HERE
 */

const BookButton = styled('button')(({ isBooked }) => ({
  backgroundColor: 'white',
  border: isBooked ? '1px solid #eb193e' : '1px solid #00194b',
  color: isBooked ? '#eb193e' : '#00194b',
  borderRadius: '3px',
  paddingTop: '8px',
  paddingBottom: '8px',
  textAlign: 'center',
  textDecoration: 'none',
  display: 'inline-block',
  fontSize: '14px',
  marginTop: '16px',
  width: '200px',
  ':hover': {
    backgroundColor: isBooked ? '#eb193e' : '#00194b',
    color: 'white',
  },
}));
```

To perform a mutation, you'll need to write the mutation string, wrap it in a `gql` tag and pass it to the `mutation` prop of the `Mutation` component. In order to add a launch to a cart, you need to invoke a mutation that adds the lunch to a cart.

Within the page container, the details of the launch gotten from the `LAUNCH_DETAILS_QUERY` is rendered on the screen. Then, the `ADD_TO_CART_MUTATION` is invoked by passing it to the `mutation` prop of the `Mutation` component. Worthy of note is that the first argument passed to the render prop function is the mutate function which is `addToCart` in this case. This function informs Apollo Client that you'll like to trigger a mutation.

The second argument to the render prop function is an object with your mutation result on the `data` property, as well as the `loading` and `error` boolean properties for loading and error states respectively.

<h2 id="fetch-data">Update data with Mutation</h2>

The `Mutation` component has the ability to accept variables as props. The value of the variable passed to the `Mutation` component is the value needed to be passed as an argument to the `addToCart` mutation for it to trigger successfully. In our case, it's the `launchId` which represents the id of the current launch. You submit the form by clicking on the `BookButton` which triggers the mutation.

Once the mutation has been triggered, the cart data is updated with the launch. Now, the update happens locally because of the `@client` directive appended to the `addToCart` field. The local Apollo cache contains cart data that keeps been updated as long as launches are added to the cart.

<h2 id="pagination">Update the Apollo cache</h2>

The Apollo cache is the local store that Apollo creates and manages for you to enable fast updates, and retrieval of items in your app rather than doing a round trip to the server for every update!

Navigate to `src/pages` directory and create a `cart.js` file. Copy the code below and add to it. This page books all the trips present in the cart and updates the Apollo cache.

_src/pages/cart.js_

```js
import React from 'react';
import styled from 'react-emotion';
import PageContainer from '../components/page-container';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { Redirect } from '@reach/router';

import LaunchTile from '../components/launch-tile';

const CART_ITEMS_QUERY = gql`
  query Cart {
    cartItems @client
  }
`;

const LAUNCH_QUERY = gql`
  query LaunchTileQuery($launchId: ID!) {
    launch(id: $launchId) {
      id
      isBooked
      year
      rocket {
        name
      }
      mission {
        name
        missionPatch
      }
    }
  }
`;

const BOOK_TRIPS_MUTATION = gql`
  mutation bookTrips($launchIds: [ID]!) {
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

export default () => (
  <PageContainer>
    <Query query={CART_ITEMS_QUERY}>
      {({ data: cartData, loading: cartLoading, error: cartError, client }) => {
        if (cartLoading) return <p>Loading...</p>;
        if (cartError) return <p>ERROR: {cartError.message}</p>;
        if (!cartData.cartItems || !cartData.cartItems.length)
          return <Redirect to="/" />;

        return cartData.cartItems.map(launchId => {
          return (
            <div style={{ width: '100%' }}>
              <Query query={LAUNCH_QUERY} variables={{ launchId }}>
                {({ data, loading, error }) => {
                  return !loading && !error && data ? (
                    <LaunchTile launch={data.launch} isLoggedIn={true} />
                  ) : null;
                }}
              </Query>
              <Mutation
                mutation={BOOK_TRIPS_MUTATION}
                variables={{ launchIds: cartData.cartItems }}
                onCompleted={data => {
                  if (!data.bookTrips.success) return;
                  client.writeData({ data: { cartItems: [] } });
                }}
              >
                {(bookTrips, { data, loading, error }) =>
                  data && data.bookTrips && !data.bookTrips.success ? (
                    <p>{data.bookTrips.message}</p>
                  ) : (
                    <button onClick={bookTrips}>Reserve</button>
                  )
                }
              </Mutation>
            </div>
          );
        });
      }}
    </Query>
  </PageContainer>
);
```

The first query, `CART_ITEMS_QUERY` fetches all the launch ids from Apollo cache and passes them to `LAUNCH_QUERY` to fetch the details of each of the launches. Within the `<PageContainer>`, the `CART_ITEMS_QUERY` is first invoked. Once the items are returned, the second query `LAUNCH_QUERY` is invoked to fetch the details for each of the cart items.

To bulk book all the trips, the `BOOK_TRIPS_MUTATION` mutation is invoked by passing it to the `mutation` prop of the `Mutation` component and triggered by the **Reserve** button. The `bookTrips` mutation takes in the launch ids as variables and on completion of the mutation, it updates our Apollo cache.

You can invoke an action after a mutation has completed via the `onCompleted` prop. In our code above, the `onCompleted` function checks if the mutation was successful. If it was successful, the `cartItems` data in our Apollo cache is updated to an empty array via the `client.writeData` method.


<h2 id="testing">Test Mutation components</h2>