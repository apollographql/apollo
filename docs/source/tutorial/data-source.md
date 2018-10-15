---
title: "2. Hook up your data sources"
description: Start here for the Apollo fullstack tutorial
---

Apollo data sources provide the best experience for fetching and caching data from REST endpoints, web services, and databases. It's a new pattern for loading data from various sources, with built-in support for deduplication, caching, and error handling.

<h2 id="rest-api">Connect a REST API</h2>

To get started, install the `apollo-datasource` and `apollo-datasource-rest` packages:

```bash
npm install apollo-datasource apollo-datasource-rest --save
```

* **apollo-datasource**: This is the generic data source package. It's good for connecting to non-REST data sources.
* **apollo-datasource-rest**: This package exposes the `RESTDataSource` class that is responsible for fetching data from a given REST API. To define a data source for the REST endpoint, extend the `RESTDataSource` class and implement the data fetching methods that your resolvers require.


Create a new `datasources` folder inside the `src` directory. This folder will contain our data source files. Now, create `launch.js` within the `datasources` directory.

The REST API endpoint we'll use for our app is `https://api.spacexdata.com/v2/`. Go ahead and add the endpoint as the base URL as shown in the code below:

_src/datasources/launch.js_

```js
const { RESTDataSource } = require('apollo-datasource-rest');

class LaunchAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://api.spacexdata.com/v2/';
  }
}

module.exports = LaunchAPI;
```

In the code above, we required the `RESTDataSource` class and extended it with our custom `LaunchAPI` class. We then set up the base URL in the class constructor to the endpoint that fetches the data needed for our application.

The next step is to add methods to the `LaunchAPI` class that corresponds to the type of queries our UI will fetch from the server. According to our app specifications, we'll need to get all the launches, and get a specific launch. So, let's take care of the former immediately.

_src/datasources/launch.js_

```js
...
async getAllLaunches() {
  const res = await this.get('launches');

  return res && res.length ? res.map(launch => {
    return {
      id: launch.flight_number || 0,
      cursor: `${launch.launch_date_unix}`,
      mission: {
        name: launch.mission_name,
        missionPatch: launch.links.mission_patch_small
      },
      year: launch.launch_year,
      rocket: {
        id: launch.rocket.rocket_id,
        name: launch.rocket.rocket_name,
        type: launch.rocket.rocket_type,
      },
      launchSuccess: launch.launch_success,
    };
  }) : [];
}
```

In the code above, `this.get('launches')`, makes a `GET` request to `https://api.spacexdata.com/v2/launches` and stores the returned data in the `res` variable. If the `res` variable is not empty, then the `getAllLaunches` method returns an object that corresponds with the schema fields of the `Launch` schema type, else, an empty array is returned.

Let's refactor the `getAllLaunches` method to be a lot cleaner and concise. Copy the `launchReducer` method below and add to the file. Now, refactor the `getAllLaunches` method to use the `launchReducer` method as shown below:

_src/datasources/launch.js_

```js
...
launchReducer(launch) {
  return {
    id: launch.flight_number || 0,
    cursor: `${launch.launch_date_unix}`,
    mission: {
      name: launch.mission_name,
      missionPatch: launch.links.mission_patch_small
    },
    year: launch.launch_year,
    rocket: {
      id: launch.rocket.rocket_id,
      name: launch.rocket.rocket_name,
      type: launch.rocket.rocket_type,
    },
    launchSuccess: launch.launch_success,
  };
}

async getAllLaunches() {
  const res = await this.get('launches');

  return res && res.length ? res.map(l => this.launchReducer(l)) : [];
}
```

With the above changes, we can easily make changes to the `launchReducer` method while the `getAllLaunches` method stays lean and concise. The `launchReducer` method also makes testing the `LaunchAPI` data source class easier. The later part of this tutorial covers testing!

Next, let's take care of getting a specific launch. Add the method, `getLaunchById`, and `getLaunchesByIds` to the `LaunchAPI` class.

```js
...
async getLaunchById({ launchId }) {
  const res = await this.get('launches', { flight_number: launchId });
  return this.launchReducer(res[0]);
}

async getLaunchesByIds({ launchIds }) {
  return Promise.all(
    launchIds.map(launchId => this.getLaunchById({ launchId })),
  );
}
```

The `getLaunchById` method takes in a flight number and returns the data for a particular launch, while `getLaunchesByIds` returns several launches based on their respective `launchIds`. `Promise.all()` takes an array of promises and returns a single promise that resolves when all the promises in the array have been resolved with their fulfilled values.

<h2 id="database">Connect a database</h2>

A data store is needed for saving and fetching user information. It's also important for user trips. Let's make use of [SQLite](https://www.sqlite.org) for our app's database. SQLite is a self-contained, light-weight, zero-configuration and embedded SQL database engine.

Before connecting to SQLite, go ahead and install the `sequelize` package from npm:

```bash
npm install sequelize --save
```

**Sequelize** is an ORM for Node.js that supports several relational database management systems such as MySQL, MariaDB, PostgreSQL, SQLite and MSSQL. In this tutorial, we'll make use of it for the SQLite database.

Now, create a `store.sqlite` file in the root directory. Once you have done that, change from the root directory to the `src/datasources` directory:

```bash
cd src/datasources
```

Next, create a `user.js` file inside the `src/datasources` directory. We'll connect to the SQLite database and set up the methods for interacting with the SQL data source within the `src/datasources/user.js` file. Time to set that up!

Copy the code below and add it to the `src/datasources/user.js` file.

_src/datasources/user.js_

```js
const { DataSource } = require('apollo-datasource');
const isEmail = require('isemail');

class UserAPI extends DataSource {
  constructor({ store }) {
    super();
    this.store = store;
  }

  initialize(config) {
    this.context = config.context;
  }
}
```

In the code above, we passed an instance of `store`, which is the function for interacting with the SQLite database into the constructor.

The `initialize` method is a `DataSource` class method that allows for setting up config within the `UserAPI` class. In this scenario, we assign `context` manually to the class variable, `this.context`, because custom data sources don't automatically get the request context from the `ApolloServer` constructor.

Let's add more methods to the `UserAPI` class.

<h4 id="create-user">Create a User</h4>

Head over to your terminal and install the `isemail` package:

```bash
npm install isemail --save
```

The `isemail` package is an npm module that validates emails. Now, write the code to find or create a user within the `UserAPI` class below:

_src/datasources/user.js_

```js
...

async findOrCreateUser() {
  const email = this.context && this.context.user ? this.context.user.email : null;

  if (!email || !isEmail.validate(email)) return null;

  const users = await this.store.users.findOrCreate({ where: { email } });
  return users && users[0] ? users[0] : null;
}
```

The `findOrCreateUser` method checks the context object whether a user's email is present or not. It then checks whether the email is a valid email address. If it's not valid, null is returned, else it runs a check within the `users` table in the SQLite database. If the email exists in the database, then the user already exists, else a new user is created, and stored in the database.

It's worthy to note that the user object in `this.context` is extracted from the token gotten from the request headers during authentication. The value is then passed to the `context`. This is why we can access the user via `this.context.user` and `this.context.user.email`.

<h4 id="book-and-cancel-trip">Book and Cancel a Trip</h4>

Add a `bookTrip` and `cancelTrip` method to the `UserAPI` data source class.

_src/datasources/user.js_

```js
...
class UserAPI extends DataSource {
  constructor() {
    ...
  }

  ...

  async bookTrip({ launchId }) {
    const userId = this.context.user.id;
    return !!this.store.trips.findOrCreate({ where: { userId, launchId } });
  }

  async cancelTrip({ launchId }) {
    const userId = this.context.user.id;
    return !!this.store.trips.destroy({ where: { userId, launchId } });
  }
}
...
```

A user selects a particular launch and books a trip. The `userId` and `launchId` values are needed to book the trip successfully. Therefore, the `bookTrip` method accepts a `launchId` via its arguments, obtains the `userId` via the `context` object and invokes the `findOrCreate` method on the `trips` table to book the trip.

The `cancelTrip` method requires a `userId` and `launchId` to delete a trip from the `trips` table successfully. Therefore, the `cancelTrip` method performs almost the same operation as the `bookTrip` method except that it invokes the `destroy` method on the `trips` table and deletes the trip.

<h4 id="get-launches">Get All Launches By User</h4>

We need to get all the launches reserved by a user. This calls for a method, `getLaunchIdsByUser`. Copy the method below and add it to the file.

_src/datasources/user.js_

```js
...
class UserAPI extends DataSource {
  constructor() {
    ...
  }

  ...

  async getLaunchIdsByUser() {
    const userId = this.context.user.id;
    const found = await this.store.trips.findAll({
      where: { userId },
    });
    return found && found.length
      ? found.map(l => l.dataValues.launchId).filter(l => !!l)
      : [];
  }
}
...
```

Let's analyze the code above.

In the `getLaunchIdsByUser` method, a `userId` is accepted via the `context` object. All the trips booked by a user with a particular `userId` are fetched and stored in the `found` variable. If there are trips found, then an array of launch ids are returned else an empty array is returned.

<h4 id="get-launches">Get Booked Status on a Launch</h4>

We need to add a method that can return the booked status of a launch for a particular user. Copy the method, `isBookedOnLaunch` below and add it to the `UserAPI` class.

_src/datasources/user.js_

```js
...
async isBookedOnLaunch({ launchId }) {
  const userId = this.context.user.id;
  const found = await this.store.trips.findAll({
    where: { userId, launchId },
  });
  return found && found.length > 0;
}
```

In the `isBookedOnLaunch` method, we invoke the `findAll` method of the `trips` table to find out if the particular launch passed to the method via `launchId` has been booked by the logged-in user.

In the various methods that we created and copied to the `UserAPI` class, you must have noticed `this.store.users` and `this.store.trips`. These are two tables from our potential SQLite data store. Let's create the store!

<h4 id="create-the-store">Create the Store</h4>

Create an `utils.js` file inside the `src` directory. Now, copy the code below and add to it.

_src/utils.js_

```js
const SQL = require('sequelize');

module.exports.createStore = () => {
  const Op = SQL.Op;
  const operatorsAliases = {
    $in: Op.in,
  };

  const db = new SQL('database', 'username', 'password', {
    dialect: 'sqlite',
    storage: './store.sqlite',
    operatorsAliases,
  });

  const users = db.define('user', {
    id: {
      type: SQL.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    createdAt: SQL.DATE,
    updatedAt: SQL.DATE,
    email: SQL.STRING,
    token: SQL.STRING,
  });

  const trips = db.define('trip', {
    id: {
      type: SQL.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    createdAt: SQL.DATE,
    updatedAt: SQL.DATE,
    launchId: SQL.INTEGER,
    userId: SQL.INTEGER,
  });

  return { users, trips };
};
```

In the code above, the `createStore` function sets up a new SQL instance that connects to the SQLite database. A `database`, `username`, and `password` values are passed as arguments. And an object specifying the `dialect`, location of the SQLite database and operator aliases is also passed as an argument to the SQL instance.

The `users` and `trips` tables have now been defined with their respective fields. And an object containing `users` and `trips`is returned within the `createStore` function to enable us access the ORM methods later on, in the body of our data source.

<h2 id="database">Connect Data Sources and Store to Server</h2>

Now that we have defined our data sources, they need to be passed as options to the `ApolloServer` constructor so that our resolvers can access them.

Copy the code below and add it to the `src/index.js` file.

_src/index.js_

```js
...
...
const typeDefs = require('./schema');
const { createStore } = require('./utils');
const LaunchAPI = require('./datasources/launch');
const UserAPI = require('./datasources/user');
const store = createStore();

// Set up Apollo Server
const server = new ApolloServer({
  typeDefs,
  dataSources: () => ({
    launchAPI: new LaunchAPI(),
    userAPI: new UserAPI({ store }),
  }),
  context: async ({ req }) => {

    const email = 'johndoe@apollo.com';

    // if the email isn't formatted validly, return null for user
    if (!isEmail.validate(email)) return { user: null };

    // find a user by their email
    const users = await store.users.findOrCreate({ where: { email } });

    const user = users && users[0] ? users[0] : null;

    return { user: { ...user.dataValues } };
  },
});
```

In the code above, we required the `launch` and `user` data source files, created an instance of both classes and passed them as objects to the `dataSources` function in `ApolloServer`'s constructor.

We also required the `utils.js` file, assigned the `createStore()` method to a `store` variable and passed it to the `UserAPI` constructor. The `createStore()` method is responsible for making sure the `users` and `trips` tables exist.

```js
 dataSources: () => ({
    launchAPI: new LaunchAPI(),
    userAPI: new UserAPI({ store }),
  }),
```

The block of code above ensures that when Apollo Server boots up, the server puts the data sources on the `context` for every request, so you can access them from your resolvers.

Now, what about the `context` function defined explicitly in the `ApolloServer` constructor?

As shown in the code above, If the email presented is not valid, a null user is returned as the `context` object's value.

If the email is valid, we simply look up the email in the `users` store. If the user exists, we return the user's details as the `context` object's value, else we return null. The user's details is what we access as `this.context.user` via the `initialize` method in the `UserAPI` data source class.

In the next section of this tutorial, we'll write the resolvers for our app and you'll learn more about `context` and how to access the data sources on them.