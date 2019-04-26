---
title: "6. Fetch data with queries"
description: Learn how to fetch data with the Query component
---

 Time to accomplish: _15 Minutes_

Apollo Client simplifies fetching data from a graph API because it intelligently caches your data, as well as tracks loading and error state. In the previous section, we learned how to fetch a sample query with Apollo Client without using a view integration. In this section, we'll learn how to use the `Query` component from `react-apollo` to fetch more complex queries and execute features like pagination.

## The Query component

The `Query` component is one of the most important building blocks of an Apollo app. It's a React component that fetches a GraphQL query and exposes the result so you can render your UI based on the data it returns.

The `Query` component uses the **render prop** pattern to fetch and load data from queries into our UI. The render prop pattern provides the ability to add a function as a child to our `Query` component that will notify React about what you want to render. It exposes the `error`, `loading` and `data` on a result object that is passed into the render prop function. Let's see an example:

## Fetching a list

To create a `Query` component, import `Query` from `react-apollo`, pass your query wrapped with `gql` to `this.props.query`, and provide a render prop function to `this.props.children` that uses the `loading`, `data`, and `error` properties on the result object to render UI in your app.

First, we're going to build a GraphQL query that fetches a list of launches. We're also going to import some components that we will need in the next step. Navigate to `src/pages/launches.js` to get started and copy the code below into the file.

_src/pages/launches.js_

```js
import React, { Fragment } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { LaunchTile, Header, Button, Loading } from '../components';

const GET_LAUNCHES = gql`
  query launchList($after: String) {
    launches(after: $after) {
      cursor
      hasMore
      launches {
        id
        isBooked
        rocket {
          id
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
```

Here, we're defining a query to fetch a list of launches by calling the `launches` query from our schema. The `launches` query returns an object type with a list of launches, in addition to the `cursor` of the paginated list and whether or not the list `hasMore` launches. We need to wrap the query with the `gql` function in order to parse it into an AST.

Now, let's pass that query to Apollo's `Query` component to render the list:

_src/pages/launches.js_

```jsx
export default function Launches() {
  return (
    <Query query={GET_LAUNCHES}>
      {({ data, loading, error }) => {
        if (loading) return <Loading />;
        if (error) return <p>ERROR</p>;

        return (
          <Fragment>
            <Header />
            {data.launches &&
              data.launches.launches &&
              data.launches.launches.map(launch => (
                <LaunchTile
                  key={launch.id}
                  launch={launch}
                />
              ))}
          </Fragment>
        );
      }}
    </Query>
  );
};
```

To render the list, we pass the `GET_LAUNCHES` query from the previous step into our `Query` component. We then define a render prop function as the child of `Query` that's called with the state of our query (`loading`, `error`, and `data`). Depending on the state, we either render a loading indicator, an error message, or a list of launches.

We're not done yet! Right now, this query is only fetching the first 20 launches from the list. To fetch the full list of launches, we need to build a pagination feature that displays a `Load More` button for loading more items on the screen. Let's learn how!

### Build a paginated list

Apollo Client has built-in helpers to make adding pagination to our app much easier than it would be if we were writing the logic ourselves.

To build a paginated list with Apollo, we first need to destructure the `fetchMore` function from the `Query` render prop function.

_src/pages/launches.js_

```jsx
export default function Launches() {
  return (
    <Query query={GET_LAUNCHES}>
      {({ data, loading, error, fetchMore }) => { // highlight-line
        // same as above
      }}
    </Query>
  );
};
```

Now that we have `fetchMore`, let's connect it to a Load More button to fetch more items when it's clicked. To do this, we will need to specify an `updateQuery` function on the return object from `fetchMore` that tells the Apollo cache how to update our query with the new items we're fetching.

Copy the code below and add it above the closing `</Fragment>` tag in the render prop function we added in the previous step.

_src/pages/launches.js_

```jsx
{data.launches &&
  data.launches.hasMore && (
    <Button
      onClick={() =>
        fetchMore({ // highlight-line
          variables: {
            after: data.launches.cursor,
          },
          updateQuery: (prev, { fetchMoreResult, ...rest }) => { // highlight-line
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
        })
      }
    >
      Load More
    </Button>
  )
}
```

First, we check to see if we have more launches available in our query. If we do, we render a button with a click handler that calls the `fetchMore` function from Apollo. The `fetchMore` function receives new variables for the list of launches query, which is represented by our cursor.

We also define the `updateQuery` function to tell Apollo how to update the list of launches in the cache. To do this, we take the previous query result and combine it with the new query result from `fetchMore`.

In the next step, we'll learn how to wire up the launch detail page to display a single launch when an item in the list is clicked.

## Fetching a single launch

Let's navigate to `src/pages/launch.js` to build out our detail page. First, we should import some components and define our GraphQL query to get the launch details.

_src/pages/launch.js_

```jsx
import React, { Fragment } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import Loading from '../components/loading';
import Header from '../components/header';
import ActionButton from '../containers/action-button';
import LaunchDetail from '../components/launch-detail';

export const GET_LAUNCH_DETAILS = gql`
  query LaunchDetails($launchId: ID!) {
    launch(id: $launchId) {
      id
      site
      isBooked
      rocket {
        id
        name
        type
      }
      mission {
        name
        missionPatch
      }
    }
  }
`;
```

Now that we have a query, let's render a `Query` component to execute it. This time, we'll also need to pass in the `launchId` as a variable to the query, which we'll do by adding a `variables` prop to `Query`. The `launchId` comes through as a prop from the router.

_src/pages/launch.js_

```jsx
export default function Launch({ launchId }) {
  return (
    <Query query={GET_LAUNCH_DETAILS} variables={{ launchId }}>
      {({ data, loading, error }) => {
        if (loading) return <Loading />;
        if (error) return <p>ERROR: {error.message}</p>;

        return (
          <Fragment>
            <Header image={data.launch.mission.missionPatch}>
              {data.launch.mission.name}
            </Header>
            <LaunchDetail {...data.launch} />
            <ActionButton {...data.launch} />
          </Fragment>
        );
      }}
    </Query>
  );
}
```

Just like before, we use the status of the query to render either a `loading` or `error` state, or data when the query completes.

### Using fragments to share code

You may have noticed that the queries for fetching a list of launches and fetching a launch detail share a lot of the same fields. When we have two GraphQL operations that contain the same fields, we can use a **fragment** to share fields between the two.

To learn how to build a fragment, navigate to `src/pages/launches.js` and copy the code below into the file:

_`src/pages/launches.js`_

```js
export const LAUNCH_TILE_DATA = gql`
  fragment LaunchTile on Launch {
    id
    isBooked
    rocket {
      id
      name
    }
    mission {
      name
      missionPatch
    }
  }
`;
```

We define a GraphQL fragment by giving it a name (`LaunchTile`) and defining it on a type on our schema (`Launch`). The name we give our fragment can be anything, but the type must correspond to a type in our schema.

To use our fragment in our query, we import it into the GraphQL document and use the spread operator to spread the fields into our query:

_`src/pages/launches.js`_

```js{6,10}
const GET_LAUNCHES = gql`
  query launchList($after: String) {
    launches(after: $after) {
      cursor
      hasMore
      launches {
        ...LaunchTile
      }
    }
  }
  ${LAUNCH_TILE_DATA}
`;
```

Let's use our fragment in our launch detail query too. Be sure to import the fragment from the `launches` page before you use it:

```js{1,10,13}
import { LAUNCH_TILE_DATA } from './launches';

export const GET_LAUNCH_DETAILS = gql`
  query LaunchDetails($launchId: ID!) {
    launch(id: $launchId) {
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

Great, now we've successfully refactored our queries to use fragments. Fragments are a helpful tool that you'll use a lot as you're building GraphQL queries and mutations.

### Customizing the fetch policy

Sometimes, it's useful to tell Apollo Client to bypass the cache altogether if you have some data that constantly needs to be refreshed. We can do this by customizing the `Query` component's `fetchPolicy`.

First, let's navigate to `src/pages/profile.js` and write our query:

_src/pages/profile.js_

```js
import React, { Fragment } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { Loading, Header, LaunchTile } from '../components';
import { LAUNCH_TILE_DATA } from './launches';

const GET_MY_TRIPS = gql`
  query GetMyTrips {
    me {
      id
      email
      trips {
        ...LaunchTile
      }
    }
  }
  ${LAUNCH_TILE_DATA}
`;
```

Next, let's render a `Query` component to fetch a logged in user's list of trips. By default, Apollo Client's fetch policy is `cache-first`, which means it checks the cache to see if the result is there before making a network request. Since we want this list to always reflect the newest data from our graph API, we set the `fetchPolicy` for this query to `network-only`:

_src/pages/profile.js_

```jsx
export default function Profile() {
  return (
    <Query query={GET_MY_TRIPS} fetchPolicy="network-only"> {/* highlight-line */}
      {({ data, loading, error }) => {
        if (loading) return <Loading />;
        if (error) return <p>ERROR: {error.message}</p>;

        return (
          <Fragment>
            <Header>My Trips</Header>
            {data.me && data.me.trips.length ? (
              data.me.trips.map(launch => (
                <LaunchTile key={launch.id} launch={launch} />
              ))
            ) : (
              <p>You haven't booked any trips</p>
            )}
          </Fragment>
        );
      }}
    </Query>
  );
}
```

If you try to render this query, you'll notice that it returns null. This is because we need to implement our login feature first. We're going to tackle login in the next section.

Now that we've learned how to build `Query` components that can fetch a paginated list, share fragments, and customize the fetch policy, it's time to progress to the next section so we can learn how to update data with mutations!
