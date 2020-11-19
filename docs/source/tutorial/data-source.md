---
title: 'Connect to data sources'
sidebar_title: '2. Connect to data sources'
description: Fetch data from multiple locations
---

> Time to accomplish: 10 minutes

Now that we've constructed our schema, we need to connect data sources to Apollo Server. **A data source is any database, service, or API that holds the data you use to populate your schema's fields.** Your GraphQL API can interact with any combination of data sources.

Apollo provides a `DataSource` class that we can extend to handle interaction logic for a particular type of data source. In this section, we'll extend `DataSource` to connect both a REST API and a SQL database to Apollo Server. Don't worry, you don't need to be familiar with either of these technologies to follow along with the examples.

## Connect a REST API

Let's connect the [SpaceX v2 REST API](https://github.com/r-spacex/SpaceX-API) to our server. To do so, we'll use the `RESTDataSource` class from the `apollo-datasource-rest` package. This class is an extension of `DataSource` that handles fetching data from a REST API. To use this class, you `extend` it and provide it the base URL of the REST API it will communicate with.

The base URL for the Space-X API is `https://api.spacexdata.com/v2/`. Let's create a data source called `LaunchAPI` by adding the code below to `src/datasources/launch.js`:

```js:title=src/datasources/launch.js
const { RESTDataSource } = require('apollo-datasource-rest');

class LaunchAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://api.spacexdata.com/v2/';
  }
}

module.exports = LaunchAPI;
```

The `RESTDataSource` class automatically caches responses from REST resources with no additional setup. We call this feature **partial query caching**. It enables you to take advantage of the caching logic that the REST API already exposes.

> To learn more about partial query caching with Apollo data sources, check out [this blog post](https://blog.apollographql.com/easy-and-performant-graphql-over-rest-e02796993b2b).

### Write data-fetching methods

Our `LaunchAPI` data source needs methods that enable it to fetch the data that incoming queries will request. 

#### The `getAllLaunches` method

According to our schema, we'll need a method to get a list of all SpaceX launches. Let's add a `getAllLaunches` method to our `LaunchAPI` class:

```js:title=src/datasources/launch.js
async getAllLaunches() {
  const response = await this.get('launches');
  return Array.isArray(response)
    ? response.map(launch => this.launchReducer(launch))
    : [];
}
```

The `RESTDataSource` class provides helper methods that correspond to HTTP verbs like `GET` and `POST`. In the code above:

1. The call to `this.get('launches')` sends a `GET` request to `https://api.spacexdata.com/v2/launches` and stores the array of returned launches in `response`.
2. We use `this.launchReducer` (which we'll write next) to transform each returned launch into the format expected by our schema. If there are no launches, an empty array is returned.

Now we need to write the `launchReducer` method, which transforms returned launch data into the shape that our schema expects. This approach decouples the structure of your schema from the structure of the various data sources that populate its fields. 

First, let's recall what a `Launch` object type looks like in our schema:

```graphql
# YOU DON'T NEED TO COPY THIS CODE.
type Launch {
  id: ID!
  site: String
  mission: Mission
  rocket: Rocket
  isBooked: Boolean!
}
```

Now, let's write a `launchReducer` method that transforms launch data from the REST API into the shape above. Copy the following code into your `LaunchAPI` class:

```js:title=src/datasources/launch.js
launchReducer(launch) {
  return {
    id: launch.flight_number || 0,
    cursor: `${launch.launch_date_unix}`,
    site: launch.launch_site && launch.launch_site.site_name,
    mission: {
      name: launch.mission_name,
      missionPatchSmall: launch.links.mission_patch_small,
      missionPatchLarge: launch.links.mission_patch,
    },
    rocket: {
      id: launch.rocket.rocket_id,
      name: launch.rocket.rocket_name,
      type: launch.rocket.rocket_type,
    },
  };
}
```

Using a reducer like this enables the `getAllLaunches` method to remain concise as our definition of a `Launch` potentially changes and grows over time. It also helps with testing the `LaunchAPI` class, which we'll cover later.

#### The `getLaunchById` method

Our schema also supports fetching an individual launch by its ID. To support this, let's add _two_ methods to the `LaunchAPI` class: `getLaunchById` and `getLaunchesByIds` :

```js:title=src/datasources/launch.js
async getLaunchById({ launchId }) {
  const response = await this.get('launches', { flight_number: launchId });
  return this.launchReducer(response[0]);
}

getLaunchesByIds({ launchIds }) {
  return Promise.all(
    launchIds.map(launchId => this.getLaunchById({ launchId })),
  );
}
```

The `getLaunchById` method takes a launch's flight number and returns the data for the associated launch. The `getLaunchesByIds` method returns the result of multiple calls to `getLaunchById`.

Our `LaunchAPI` class is complete! Next, let's connect a database to our server.

## Connect a database

The SpaceX API is a read-only data source for fetching launch data. We also need a _writable_ data source that allows us to store application data, such as user identities and seat reservations. To accomplish this, we'll connect to a SQLite database and use Sequelize for our ORM. Our `package.json` file includes these dependencies, so they were installed with our `npm install` call in [Build a schema](./schema/). 

Because this section contains SQL-specific code that isn't necessary for understanding Apollo data sources, a `UserAPI` data source is included in [`src/datasources/user.js`](https://github.com/apollographql/fullstack-tutorial/blob/master/start/server/src/datasources/user.js). Navigate to that file so we can cover the high-level concepts.

### Building a custom data source

Apollo doesn't provide a canonical `DataSource` subclass for SQL databases at this time (although we'd love to help guide you if you're interested in contributing). So, we've created a custom data source for our SQLite database by extending the generic `DataSource` class.

The following core concepts of a `DataSource` subclass are demonstrated in `src/datasources/user.js`:

- **The `initialize` method**: Implement this method if you want to pass any configuration options to your subclass. The `UserAPI` class uses `initialize` to access our API's `context`.
- **`this.context`**: A graph API's context is an object that's shared across every **resolver** in a GraphQL request. We'll cover resolvers in detail in the next section. Right now, all you need to know is that the context is useful for storing and sharing user information.
- **Caching**: Although the `RESTDataSource` class provides a built-in cache, the generic `DataSource` class does _not_. You can use [cache primitives](https://www.apollographql.com/docs/apollo-server/features/data-sources/#using-memcached-redis-as-a-cache-storage-backend) to build your own caching functionality.

Let's go over some of the methods in `src/datasources/user.js` that we use to fetch and update data in our database. You'll want to refer to these in the next section:

- `findOrCreateUser({ email })`: Finds or creates a user with a given `email` in the database.
- `bookTrips({ launchIds })`: Takes an object with an array of `launchIds` and books them for the logged-in user.
- `cancelTrip({ launchId })`: Takes an object with a `launchId` and cancels that launch for the logged-in user.
- `getLaunchIdsByUser()`: Returns all booked trips for the logged-in user.
- `isBookedOnLaunch({ launchId })`: Determines whether the logged-in user has booked a trip on a particular launch.

## Add data sources to Apollo Server

Now that we've built our two data sources, we need to add them to Apollo Server.

Pass a `dataSources` option to the `ApolloServer` constructor. This option is a function that returns an object containing newly instantiated data sources. 

Navigate to `src/index.js` and add the code highlighted below (or replace the entire file with the entire code block):

```js{3,5,6,8,12-15}:title=src/index.js
const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema');
const { createStore } = require('./utils');

const LaunchAPI = require('./datasources/launch');
const UserAPI = require('./datasources/user');

const store = createStore();

const server = new ApolloServer({
  typeDefs,
  dataSources: () => ({
    launchAPI: new LaunchAPI(),
    userAPI: new UserAPI({ store })
  })
});

server.listen().then(() => {
  console.log(`
    Server is running!
    Listening on port 4000
    Explore at https://studio.apollographql.com/dev
  `);
});
```

First, we import and call the `createStore` function to set up our SQLite database. Then, we add the `dataSources` function to the `ApolloServer` constructor to connect instances of `LaunchAPI` and `UserAPI` to our graph. We also make sure to pass the database to the `UserAPI` constructor.

If you use `this.context` in a datasource, it's critical to create a _new_ instance in the `dataSources` function, rather than sharing a single instance. Otherwise, `initialize` might be called during the execution of asynchronous code for a particular user, replacing `this.context` with the context of _another_ user.

Now that we've hooked up our data sources to Apollo Server, it's time to move on to the next section and learn how to interact with our data sources from within our resolvers.
