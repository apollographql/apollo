---
title: Schema design
description: How to structure your GraphQL types, fields, and arguments
---

One of the main aspects of GraphQL is that it allows you to describe the space of data available in your system with a strongly typed schema. While GraphQL makes it possible to evolve your API over time without breaking your clients, it's always easier if you think about some schema design decisions up front to reduce the amount of refactoring you need to do later.

This article details some practices around schema design which will help you design a great GraphQL API to stand the test of time.

<h2 id="design-for-client">Designing for client needs</h2>

GraphQL schemas are at their best when they are designed around the needs of client applications.  When a team is building their first GraphQL schema, they might be tempted to create literal mappings on top of existing database collections or tables using CRUD-like root fields. While this literal database-to-schema mapping may be a fast way to get up and running, we strongly suggest avoiding it and instead building the schema around based on how the GraphQL API will be used by the front-end.

If a database has has fields or relationships that the client doesn't yet need, don’t include them in the schema up front. Adding fields later is much easier than removing them, so add fields to your API as your clients need them rather than exposing all of the possible data up front. This is especially useful because GraphQL allows you to create associations between your data that don't exist in the underlying data, enabling you to move complex data manipulation logic out of your clients.

For example, let's say you want to create a view that lists some events, their locations, and the weather at that location. In that case, you might want to do a query like this:

```graphql
query EventList {
  upcomingEvents {
    name
    date
    location {
      name
      weather {
        temperature
        description
      }
    }
  }
}
```

The desire to display this data could inform the design of a schema like the following:

```graphql
type Query {
  upcomingEvents: [Event]
  # Other fields, etc
}

type Event {
  name: String
  date: String
  location: Location
}

type Location {
  name: String
  weather: WeatherInfo
}

type WeatherInfo {
  temperature: Float
  description: String
}
```

This doesn't necessarily need to match the data returned from a single REST endpoint or database. For example, if you have a REST endpoint exposing a list of events and their locations, but not weather information, you would just need to fetch the weather information from a second endpoint (or even a 3rd party API) in your resolvers. This way, you can design a schema that will allow your frontend to be as simple as possible, without limiting yourself to the exact shape of data that's in your underlying data sources.

<h2 id="style">Style conventions</h2>

The GraphQL specification is flexible and doesn't impose specific naming guidelines. However, in order to facilitate development and continuity across GraphQL deployments, it's useful to have a general set of conventions. We suggest the following:

* **Fields** should be named in `camelCase`, since the majority of consumers will be client applications written in JavaScript, Java, Kotlin, or Swift, all of which recommend `camelCase` for variable names.
* **Types**: should be `PascalCase`, to match how classes are defined in the languages above.
* **Enums**: should have their type name in `PascalCase`, and their value names in `ALL_CAPS`, since they are similar to constants.

If you use the conventions above, you won't need to have any extra logic in your clients to convert names to match the conventions of these languages.

<h2 id="interfaces">Utilizing interfaces</h2>

Interfaces are a powerful way to build and use GraphQL schemas through the use of _abstract types_. Abstract types can't be used directly in schema, but can be used as building blocks for creating explicit types.

Consider an example where different types of books share a common set of attributes, such as _text books_ and _coloring books_. A simple foundation for these books might be represented as the following `interface`:

```graphql
interface Book {
  title: String
  author: Author
}
```

We won't be able to directly use this interface to query for a book, but we can use it to implement concrete types. Imagine a screen within an application which needs to display a feed of all books, without regard to their (more specific) type. To create such functionality, we could define the following:

```graphql
type TextBook implements Book {
  title: String
  author: Author
  classes: [Class]
}

type ColoringBook implements Book {
  title: String
  author: Author
  colors: [Color]
}

type Query {
  schoolBooks: [Book]
}
```

In this example, we've used the `Book` interface as the foundation for the `TextBook` and `ColoringBook` types. Then, a `schoolBooks` field simply expresses that it returns a list of books (i.e. `[Book]`).

Implementing the book feed example is now simplified since we've removed the need to worry about what kind of `Book`s will be returned. A query against this schema, which could return _text books_ and _coloring_ books, might look like:

```graphql
query GetBooks {
  schoolBooks {
    title
    author
  }
}
```

This is really helpful for feeds of common content, user role systems, and more!

Furthermore, if we need to return fields which are only provided by either `TextBook`s or `ColoringBook`s (not both) we can request fragments from the abstract types in the query. Those fragments will be filled in only as appropriate; in the case of the example, only coloring books will be returned with `colors`, and only textbooks will have `classes`:

```graphql
query GetBooks {
  schoolBooks {
    title
    ... on TextBook {
      classes {
        name
      }
    }
    ... on ColoringBook {
      colors {
        name
      }
    }
  }
}
```

<h2 id="mutations">Designing mutations</h2>

Mutations are one of the core types in GraphQL. Just like you can make a query to fetch information, you can make a mutation to update or change information. Unlike REST, GraphQL mutations actually are executed in two parts: the mutation itself, and a subsequent query, which can return any kind of data that you normally could query for. A mutation definition for updating the age of a `User` could look like this:

```graphql
type Mutation {
  updateUserAge(id: ID!, age: Int!): User
}

type User {
  id: ID!
  name: String!
  age: Int!
}
```

With that definition, you could then make the following mutation:

```graphql
mutation updateMyUser {
  updateUserAge(id: 1, age: 25){
    id
    age
    name
  }
}
```

With a response looking something like:

```json
{
  "data": {
    "updateUserAge": {
      "id": "1",
      "age": "25",
      "name": "jane doe"
    }
  }
}
```

The first thing to note is that it’s most common to return the thing you’re updating from a mutation. In our example, we were updating a `User` record, so we returned that updated user. There’s nothing _enforcing_ this practice, but it’s highly recommended, because it’s often needed to have an updated user to let the clients update any local cache with a new instance of that `User`. For this same reason, it’s useful design mutations to update only one entity. If you wanted to update two unrelated entities, it’s recommended to in separate mutations. For more details on how to handle errors and warnings in mutations, see the [mutation responses](#mutation-responses) section below.

But what if we wanted to update more than just a single or couple attributes on a user? Passing each thing we need as a single argument would get tedious. Especially if multiple mutations used similar fields. For this, we can use input types, which are explained in the next section.

<h3 id="mutation-input-types">Input types</h3>

Input types are a special type in GraphQL which are defined as arguments to queries and, more commonly, mutations.  They can be thought of as object types for arguments, in addition to the other scalar types.  Input types are especially useful when multiple mutations require similar information; for example, when creating a user and updating a user require the same fields, like `age` and `name`.

Input types are used like any other type and defining them is similar to a typical object type definitions, but with the `input` keyword rather than `type`.

Here is an example of two mutations that operate on a `User`, _without_ using input types:

```
type Mutation {
  createUser(name: String, age: Int, address: String, phone: String): User
  updateUser(id: ID!, name: String, age: Int, address: String, phone: String): User
}
```

To avoid the repetition of argument fields, this can be refactored to use an input type, as follows:

```
type Mutation {
  createUser(user: UserInput): User
  updateUser(id: ID!, user: UserInput): User
}

input UserInput {
  name: String
  age: Int
  address: String
  phone: String
}
```

<h3 id="mutation-responses">Responses</h3>

Mutations have a higher chance of causing errors than queries since they are modifying data.  A common way to handle errors during a mutation is to simply `throw` an error.  While that's fine, throwing an error in the resolver will return an error to the caller and prevent a partial response, which could be useful in the event of a partial update.  Consider the following mutation example, which tries to update a user's `name` and `age`:

```graphql
mutation updateUser {
  updateUser(id: 1, user: { age: -1, name: "Foo Bar" }){
    name
    age
  }
}
```

With validation in place, this mutation might cause an error since the `age` is a negative value.  While it’s possible that the entire operation should be stopped, there’s an opportunity to partially update the user’s record with the new `name` and return the updated record with the `age` left untouched.

Luckily, the powerful structure of GraphQL mutations accommodates this use case and can return transactional information about the update alongside the records which have been changed which enables client-side updates to occur automatically.

In order to provide consistency across a schema, we suggest introducing a `MutationResponse` interface which can be implemented on every mutation response in a schema and enables transactional information to be returned in addition to the normal mutation response object.

A `MutationResponse` interface would look like this:

```graphql
interface MutationResponse {
  code: String!
  success: Boolean!
  message: String!
}
```

An implementing type would look like this:

```graphql
type UpdateUserMutationResponse implements MutationResponse {
  code: String!
  success: Boolean!
  message: String!
  user: User
}
```

Calling a mutation that returns that `UpdateUserMutationResponse` type would result in a response that looks something like this:

```json
{
  "data": {
    "updateUser": {
      "code": "200",
      "success": true,
      "message": "User was successfully updated",
      "user": {
        "id": "1",
        "name": "Jane Doe",
        "age": 35
      }
    }
  }
}
```

Let’s break this down, field by field:

* `code` is a string representing a transactional value explaining details about the status of the data change. Think of this like an HTTP status code.
* `success` is a boolean indicating whether the update was successful or not. This allows a coarse check by the client to know if there were failures.
* `message` is a string that is meant to be a human-readable description of the status of the transaction. It is intended to be used in the UI of the product.
* `user` is added by the implementing type `UpdateUserMutationResponse` to return back the newly created user for the client to use!

Following this pattern for mutations provides detailed information about the data that has changed and feedback on whether the operation was successful or not.  Armed with this information, developers can easily react to failures in the client and fetch the information they need to update their local cache.

<h2 id="gql">Wrapping documents with `gql`</h2>

There are two common ways to write GraphQL schemas and queries. The first is to write queries into a `.graphql` file and import them into your other files for usage. The second is to write them wrapped them with the `gql` tag provided by the [graphql-tag library](https://github.com/apollographql/graphql-tag#graphql-tag).

We recommend doing the latter for a couple reasons. Most notably, it can save a build step. Using `.graphql` files requires a loader to parse the file and make it useful. This may not seem like a concern on the client, but it may be especially useful on the server, where there’s often not a build step.

Additionally, using the `gql` tag unlocks full syntax highlighting in most editors and auto-formatting support with [prettier](https://prettier.io/).
