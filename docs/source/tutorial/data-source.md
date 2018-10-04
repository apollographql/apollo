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
* **apollo-datasource-rest**: This package exposes the `RESTDataSource` class that is responsible for fetching data from a given REST API. To define a data source for the REST endpoint, extend the `RESTDataSource` class and implement the data fetching methods that your resolvers require. Let's look at a simple example to understand how data sources work.

```js
const { RESTDataSource } = require('apollo-datasource-rest');

class MvrpAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://mvrp.herokuapp.com/api/';
  }

  async getAllCars() {
    return this.get('cars');
  }

  async getACar(plateNumber) {
    const result = await this.get('car', {
      plateNumber
    });

    return result[0];
  }
};

module.exports = MvrpAPI;
```

The `https://mvrp.herokuapp.com/api/` endpoint is a simple REST API that returns data for cars. Furthermore, the `MvrpAPI` class implementation in the code above contains a `getAllCars` and `getACar` functions that wrap convenience methods provided by the `RESTDataSource` class for performing HTTP requests. In this example, the built-in `get` method used is responsible for `GET` requests.

Now that you have an understanding of how data sources work, let's hook it up for our tutorial app.

Create a new `datasources` folder inside the `src` directory. This folder will contain our data source files. Now, create `launch.js` within the `datasources` directory.

The REST API endpoint we'll use for our app is `https://api.spacexdata.com/v2/`. Add the endpoint as a base URL as shown in the code below:

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

The next step is to add methods to the `LaunchAPI` class that corresponds to the type of queries our UI will fetch from the server. According to our app specifications, we'll need to get all launches, and get a specific launch. So, let's take care of getting all launches.

```js
...
async getAllLaunches() {
  const res = await this.get('launches');

  return res.map(launch => {
    return {
      id: launch.flight_number || 0,
      cursor: `${launch.flight_number || 0}-${launch.mission_name}`,
      mission: {
        name: launch.mission_name,
        patch: null, // what to do here?
      },
      year: launch.launch_year,
      date: launch.launch_date_unix,
      rocket: {
        id: launch.rocket.rocket_id,
        name: launch.rocket.rocket_name,
        type: launch.rocket.rocket_type,
      },
      launchSuccess: launch.launch_success,
    };
  });
}
```

In the code above, `this.get('launches')`, makes a `GET` request to `https://api.spacexdata.com/v2/launches` and stores the returned data in the `res` variable. The `getAllLaunches` method then returns an object that corresponds with the schema fields of the `Launch` schema type.

Let's refactor the `getAllLaunches` method to be a lot cleaner and concise.

```js
...
launchReducer(launch) {
  return {
    id: launch.flight_number || 0,
    cursor: `${launch.flight_number || 0}-${launch.mission_name}`,
    mission: {
      name: launch.mission_name,
      patch: null, // what to do here?
    },
    year: launch.launch_year,
    date: launch.launch_date_unix,
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

With the above changes, we can easily make changes to the `launchReducer` method while the `getAllLaunches` method stays lean and concise.

Now, let's take care of getting a specific launch. Add the following methods, `getLaunchById`, and `getLaunchesByIds` to the `LaunchAPI` class.

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

Before connecting to SQLite, go ahead and install `sequelize`:

```bash
npm install sequelize --save
```

**Sequelize** is an ORM for Node.js that supports several relational database management systems such as MySQL, MariaDB, PostgreSQL, SQLite and MSSQL. In this tutorial, we'll make use of it for the SQLite database.

Now, create a `store.sqlite` file in the root directory. Once you have done that, change the directory from root to `src/datasources`:

```bash
cd src/datasources
```

Create a `user.js` file inside the `src/datasources` directory. We'll connect to the sqlite database and set up the methods for interacting with the SQL data source within the `src/datasources/user.js` file. Time to set up!

_src/datasources/user.js_

```js
const { DataSource } = require('apollo-datasource');
const SQL = require('sequelize');

class UserAPI extends DataSource {
  constructor() {
    super();
    this.store = createStore();
  }
}

const createStore = () => {
  const Op = SQL.Op;
  const operatorsAliases = {
    $in: Op.in,
  };

  const db = new SQL('rocket', null, null, {
    dialect: 'sqlite',
    storage: './store.sqlite',
    operatorsAliases,
  });
};

module.exports = UserAPI;
```

In the code above, the `createStore` function sets up a new SQL instance that connects to the SQLite database with the name of the database specified which is `rocket`. Username and password are null, the location and operator aliases are also required.

The `createStore` function is also invoked in the constructor and stored in a class variable called `store`.

Let's extend the `createStore` function to create a `users` and `trips` table.

```js
...
...
const createStore = () => {
  ...

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

  return { users, trips};

};
```

The `users` and `trips` tables have now been defined with their respective fields. And an object containing `users` and `trips`is returned within the `createStore` function to enable us access the ORM methods later on in the body of our data source.

Now that we are done with the table creation, let's set up methods in the `UserAPI` class to:

* Create a user.
* Book a trip.
* Cancel a trip.
* Get launches reserved by a user.
* Get all the users that have reserved a particular launch.


### Create a User

Head over to your terminal and install the `isemail` package:

```bash
npm install isemail --save
```

The `isemail` package is an npm module that validates emails. Now, write the code to find or create a user below:

_src/datasources/user.js_

```js
const { DataSource } = require('apollo-datasource');
const SQL = require('sequelize');
const isEmail = require('isemail');

class UserAPI extends DataSource {
  constructor() {
    super();
    this.store = createStore();
  }

  userReducer(user) {
    return {
      id: user.id,
      email: user.email,
      avatar: user.avatar,
    };
  }

  async findOrCreateUser({ email }) {
    if (!isEmail.validate(email)) return null;
    const users = await this.store.users.findOrCreate({ where: { email } });
    return users && users[0] ? this.userReducer(users[0]) : null;
  }
}

....
// the createStore function is here
....

module.exports = UserAPI;
```

The `userReducer` method makes the `UserAPI` class easier to test because it abstracts the user object been returned from the `findOrCreateUser` method into a different method.

The `findOrCreateUser` method takes in a user's email and checks whether the email argument is a valid email address. If it's not valid, null is returned, else it runs a check within the `users` table in the SQLite database. If the email exists in the database, then the user already exists, else a new user is created, stored in the database.

### Book and Cancel a Trip

Add a `bookTrip` and `cancelTrip` method to the `UserAPI` data source class.

_src/datasources/user.js_

```js
...
class UserAPI extends DataSource {
  constructor() {
    ...
  }

  ...

  async bookTrip({ userId, launchId }) {
    return this.store.trips.findOrCreate({ where: { userId, launchId } });
  }

  async cancelTrip({ userId, launchId }) {
    return this.store.trips.destroy({ where: { userId, launchId } });
  }
}
...
```

A user selects a particular launch and books a trip. The `userId` and `launchId` values are needed to book the trip successfully. Therefore, the `bookTrip` method invokes the `findOrCreate` method on the `trips` table to book the trip.

The `cancelTrip` method requires a `userId` and `launchId` to delete a trip from the `trips` table successfully.


### Get Launches and Users

We need to get all the launches reserved by a user and also obtain all the users that signed up for a particular launch. This calls for two methods, `getLaunchIdsByUser`, and `getUsersByLaunch`.

_src/datasources/user.js_

```js
...
class UserAPI extends DataSource {
  constructor() {
    ...
  }

  ...

  async getLaunchIdsByUser({ userId }) {
    const found = await this.store.trips.findAll({
      where: { userId: userId },
    });

    return found && found.length
      ? found.map(l => l.dataValues.launchId).filter(l => !!l)
      : [];
  }

  async getUsersByLaunch({ launchId }) {
    const found = await this.store.trips.findAll({
      where: { launchId: launchId },
    });

    const userIds = found && found.length ? found.map(l => l.dataValues.userId) : [];

    if (!userIds || !userIds.length) return [];

    const foundUsers = await this.store.users.findAll({
      where: { id: { $in: userIds } },
    });

    if (!foundUsers || !foundUsers.length) return [];

    return foundUsers.map(u => this.userReducer(u));
  }
}
...
```

Let's analyze the code above.

In the `getLaunchIdsByUser` method, a `userId` is accepted via the method argument. All the trips booked by a user with a particular `userId` are fetched and stored in the `found` variable. If there are trips found, then an array of launch ids are returned else an empty array is returned.

In the `getUsersByLaunch` method, a `launchId` is accepted via the method argument. All the trips booked for a particular launch with a specific `launchId` are fetched and stored in the `found` variable. Next, an array of user ids for trips in the `found` variable are obtained and stored in the `userIds` variable. If there are no user ids, then the `userIds` variable becomes an empty array.

So, if the `userIds` variable is empty, then the `getUsersByLaunch` method returns an empty array. However, if the `userIds` variable is not empty, then users with those ids are fetched from the users table.

If no users were found, the `getUsersByLaunch` method returns an empty array, else an array of users with their respective `id`, `email` and `avatar` is returned!

In the next section of this tutorial, we'll write our resolvers!