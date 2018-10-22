---
title: "7. Update data with mutations"
description: Learn how to update data with Mutation components
---

Now that we've learned how to fetch data with the Query component, how do we update the data?

In this section, you'll learn how to send updates from the client to your graph API with Apollo `Mutation` component. Furthermore, you'll learn how to update the Apollo cache and handle errors on the client.

<h2 id="query-component">What is a Mutation component?</h2>

The Apollo `Mutation` component is a React component that we use to handle mutations in our UI. To effectively trigger mutations from our client UI, we'll have to pass a mutation string to the `mutation` prop of the `Mutation` component.

The `Mutation` component also uses the render prop pattern where a mutate function is passed to the child function. The `loading`, `error`, and `data` properties provided by the `Query` component are also made available by the `Mutation` component.

Open `src/components` directory and create a `launch-tile.js` file. Copy the code below and add to it.

_src/components/launch-tile.js_

```js
import React from 'react';
import styled from 'react-emotion';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

const BOOK_TRIP = gql`
  mutation book($launchId: ID!) {
    bookTrip(launchId: $launchId) {
      success
      message
      launch {
        id
        isBooked
      }
    }
  }
`;

const CANCEL_TRIP = gql`
  mutation cancel($launchId: ID!) {
    cancelTrip(launchId: $launchId) {
      success
      message
      launch {
        id
        isBooked
      }
    }
  }
`;

export default ({
  launch: { id, mission, rocket, year, isBooked },
  isLoggedIn,
}) => {
  return (
    <Container>
      <img
        src={mission.missionPatch}
        style={{ height: '100px' }}
        alt={`Mission patch for ${mission.name}`}
      />
      <Content>
        <Title>
          <strong>Mission</strong>: {mission.name}, <em>{year}</em>
        </Title>
        <Description>
          <strong>Rocket</strong>: {rocket.name}
        </Description>

        {isLoggedIn ? (
          <Mutation
            mutation={isBooked ? CANCEL_TRIP : BOOK_TRIP}
            update={(cache, { data: { bookTrip, cancelTrip } }) => {
              // if there was an error making the query, cancel early
              if (
                (bookTrip && bookTrip.success) ||
                (cancelTrip && cancelTrip.success)
              )
                return;

              // find the updated launch from either the bookTrip or cancelTrip mutation
              const launch = (bookTrip || cancelTrip).launch;
              if (!launch) return;

              // update the launch in cache with the latest isBooked value
              cache.writeData({ data: { ...launch } });
            }}
          >
            {(book, { data, loading, error }) => {
              if (error) return <p>{error.message}</p>;
              if (loading) return <p>Loading...</p>;
              return (
                <BookButton
                  isBooked={isBooked}
                  onClick={() => book({ variables: { launchId: id } })}
                >
                  {isBooked ? 'Cancel Trip' : 'Book Trip'}
                </BookButton>
              );
            }}
          </Mutation>
        ) : null}
      </Content>
    </Container>
  );
};
```

To perform a mutation, you'll need to write the mutation string and wrap it in a `gql` tag. Now, we have the `BOOK_TRIP` and `CANCEL_TRIP` mutations for booking and canceling trips.

In the `Query` section, we looped through the launches and passed each launch to a  `LaunchTile` component. Here, as shown in the code above, the `LaunchTile` component takes in the launch properties and `isLoggedIn` value. And they are displayed appropriately within the `<Container>`. The mission and rocket details are displayed, however,



<h2 id="fetch-data">Update data with Mutation</h2>

<h2 id="pagination">Update the Apollo cache</h2>

<h2 id="testing">Test Mutation components</h2>