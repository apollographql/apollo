---
title: "6. Fetch data with queries"
description: Learn how to fetch data with the Query component
---

You have learned how to fetch data with Apollo Client. In this section, you'll deal with fetching more complex queries and binding the data to your UI using the `Query` component from `react-apollo`.

<h2 id="query-component">What is a Query component?</h2>

Fetching data in a simple, predictable and optimistic way is one of the core features of Apollo Client. `react-apollo`, a view layer integration for Apollo Client, exports a `Query` React component that allows you pass a GraphQL query string wrapped with the `gql` tag to a `query` prop.

The `Query` component uses the render prop pattern to fetch and load data from queries into our React UI. The render prop pattern provides the ability to add a function as a child to our `Query` component that will notify React about what you want to render. The `Query` component exposes the `error`, `loading` and `data` state properties that you can use to determine the type of UI to render depending on the state of the query.

<h2 id="fetch-data">Fetch data with Query</h2>

Let's create a query and fetch data with the `Query` component.

Navigate to `src/components` directory and create a `launch-list.js` file. Copy the code below and add to it.

_src/components/launch-list.js_

```js
import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'react-emotion';

import LaunchTile from './launch-tile';

const LIST_LAUNCHES = gql`
  query launchList($after: String) {
    isLoggedIn @client
    launches(after: $after) {
      cursor
      hasMore
      launches {
        isBooked
        id
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
  }
`;


export default class LaunchList extends React.Component {
  render() {
    return (
      <Query query={LIST_LAUNCHES}>
        {({ data, loading, error }) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <p>ERROR</p>;

          return (
            <Container>
              {data.launches && data.launches.launches
                ? data.launches.launches.map(l => (
                    <LaunchTile
                      key={l.id}
                      launch={l}
                      isLoggedIn={data.isLoggedIn}
                    />
                  ))
                : null}
            </Container>
          );
        }}
      </Query>
    );
  }
}

const Container = styled('div')({
  marginBottom: '16px',
  width: '100%',
});

const LoadMoreButton = styled('button')({
  backgroundColor: '#00194b',
  border: 'none',
  color: 'white',
  padding: '15px 32px',
  textAlign: 'center',
  textDecoration: 'none',
  display: 'inline-block',
  fontSize: '16px',
});
```

**Note:** We used `react-emotion` for styling. Make sure the `react-emotion` package is installed.

To fetch data using the `Query` component, a query string needs to be passed to the `query` prop. The `LIST_LAUNCHES` query was passed to the `query` prop of the `Query` component to fetch a list of all the launches.

The `Query` component uses a render prop pattern, so we passed a function as a child to the component that contains what React will render to the screen. The `Query` component provides us with a `loading`, `error`, and `data` property that keeps the user informed about the status of the query operation on the screen. If it's in a loading state, the user sees **Loading...** on the screen. If there's an error, the user sees **ERROR** on the screen.

If the data was returned successfully, then the launches are retrieved from the `data` property and displayed on the screen via the `LaunchTile` component. For now, you can copy the contents of `src/components/launch-tile.js` from the [Launch Tile component on GitHub](https://github.com/apollographql/fullstack-tutorial/blob/client/client/src/components/launch-tile.js).

Now, there are a lot of launches. If all the launches are fetched at once and displayed, the result will be a long undesirable list. Therefore, let's build a pagination feature that accomodates the loading of a few items at once and display a `Load More` button for loading more items on the screen.

The `@client` directive added to the `isLoggedIn` field fetches local data from the Apollo Cache instead of making a network request like the rest of the fields in the `launchlist` query. You'll know more about this in the [Managing local State](./local-state.html) section.

<h2 id="pagination">Build a paginated list</h2>

There are different approaches to building a paginated list. You'll build a pagination feature using the `cursor-based` approach. The cursor keeps track of where in the data set the next items should be fetched from.

In the code below, we use a `fetchMore` query to continuously load new launches, which will be prepended to the list. The cursor to be used in the fetchMore query is provided in the initial server response, and is updated whenever more data is fetched.

Copy the code below and add to the `LaunchList` class.

```js
...
export default class LaunchList extends React.Component {
  updateQuery = (prev, { fetchMoreResult }) => {
      if (!fetchMoreResult) return prev;
      return {
        ...fetchMoreResult,
        launches: {
          ...fetchMoreResult.launches,
          launches: [
            ...prev.launches.launches,
            ...fetchMoreResult.launches.launches,
          ],
        },
      };
  },

  render() {
    return (
      <Query query={LIST_LAUNCHES}>
        {({ data, loading, error, fetchMore }) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <p>ERROR</p>;

          return (
            <Container>
              {data.launches && data.launches.launches
                ? data.launches.launches.map(l => (
                    <LaunchTile
                      key={l.id}
                      launch={l}
                      isLoggedIn={data.isLoggedIn}
                    />
                  ))
                : null}
              {data.launches && data.launches.hasMore ? (
                <LoadMoreButton
                  onClick={() =>
                    fetchMore({
                      variables: {
                        after: data.launches.cursor,
                      },
                      updateQuery: this.updateQuery(prev, { fetchMoreResult })
                    })
                  }
                >
                  Load More
                </LoadMoreButton>
              ) : null}
            </Container>
          );
        }}
      </Query>
    );
}
```

The easiest way to go about pagination with Apollo is with the `fetchMore` function which is provided as a property by the `Query` component. By default, 20 launches are returned at once. Why 20? The paginate helper function in the  `src/utils.js` file accepts a page size of 20 if no argument was passed to specify the number of launches to return.

The next step is to check if the `hasMore` property on the launches returned is true. If true, then present a `<LoadMoreButton>` for the user to click.

The `<LoadMoreButton>`'s `onClick` function invokes the `fetchMore` function. By default, `fetchMore` calls the original query but with a new set of input, which is the `data.launches.cursor` value passed to the `after` key as a new variable.

Once the new data is returned from the server, the `updateQuery` function is used to merge it with the existing data, which will cause a re-render of your UI component with an expanded list.

<h2 id="testing">Test Query components</h2>