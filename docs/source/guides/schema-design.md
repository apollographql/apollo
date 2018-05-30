---
title: Schema design
description: Our recommendations for architecting your dream GraphQL API
---

GraphQL schemas are at their best when they are designed around the needs of client applications.  When a team is building their first GraphQL schema, they might be tempted to create literal mappings on top of existing database collections or tables using CRUD-like root fields but it’s important to consider how this could be disadvantageous.

While this literal database-to-schema mapping may be a fast way to get up and running, we strongly suggest avoiding it and instead building the schema around based on how the GraphQL API will be used by the front-end.

## Style conventions

The GraphQL specification is flexible in the style that it dictates and doesn't impose specific naming guidelines. In order to facilitate development and continuity across GraphQL deployments, we suggest the following style conventions:

* **Fields**: are recommended to be written in `camelCase`, since the majority of consumers will be client applications written in JavaScript.
* **Types**: should be `PascalCase`.
* **Enums**: should have their name in `PascalCase` and their values in `ALL_CAPS` to denote their special meaning.

## Wrapping documents with gql

There are two common ways to write GraphQL schemas and queries. The first is to write queries into a `.graphql` file and import them into your other files for usage. The second is to write them wrapped them with the `gql` tag provided by the `graphql-tag` library.

We recommend doing the latter for a couple reasons. Most notably, it can save a build step. Using `.graphql` files requires a loader to parse the file and make it useful. This may not seem like a concern on the client, but it may be especially useful on the server, where there’s often not a build step.

Additionally, using the `gql` tag unlocks full syntax highlighting in most editors and auto-formatting support with [prettier](https://prettier.io/).

Here’s an example of how to use the `gql` tag to wrap your schemas

<!-- TODO: can insert the glitch apollo-launchpad example here? --> 


## Using interfaces

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

To see an interface in practice, check out this [example]()

## Designing mutations [WIP]

Mutations are one of the core types in GraphQL. Just like you can make a query to fetch information, you can make a mutation to update or change information. Unlike REST, GraphQL mutations actually are executed in two parts: the mutation itself, and a subsequent query, which can return any kind of data that you normally could query for. A mutation definition for updating the age of a `User` could look like this:

```
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

```
mutation updateMyUser {
  updateUserAge(id: 1, age: 25){
    id
    age
    name
  }
}
```

With a response looking something like: 

```
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

The first thing to note is that it’s most common to return the thing you’re updating from a mutation. In our example, we were updating a `User` record, so we returned that updated user. There’s nothing _enforcing_ this practice, but it’s highly recommended, because it’s often needed to have an updated user to let the clients update any local cache with a new instance of that `User`. For this same reason, it’s useful design mutations to update only one entity. If you wanted to update two unrelated entities, it’s recommended to in separate mutations.

But what if we wanted to update more than just a single or couple attributes on a user? Passing each thing we need as a single argument would get tedious. For this, we can use Input types.

## Input types

Input types are a special type in GraphQL reserved for using as arguments to queries and (more commonly) mutations. You can think of them as being similar to object types for your arguments, on top of the other Scalars. Input types can


1) unlike in REST, mutations can return values 

2) we recommend always returning the item you mutate in order to automatically update the Apollo Client cache (show what this would look like on the front end by requesting an id and the property you mutated)

## Mutation responses

When making a mutation, many things could go wrong. A common way for handling errors when making a mutation is to simply `throw` an error. While that's fine sometimes, other times it may be useful to get a partial response from a mutation. For example, if you're trying to update a user's `name` and `age` and you made the following mutation:

```graphql
mutation updateUser {
 updateUser(id: 1, user: { age: -1, name: "Foo Bar" }){
   name
   age
 }
}
```

This would likely cause an error, since the age was a negative value. Here, you could throw an error in the resolver, but what if you want to still update the name and return the `user`. If you simply threw an error in the resolver, you couldn't get that partial response back, and there wouldn't be an easy way to tell the client an error occurred with part of the mutation.

Mutations are an incredibly powerful part of GraphQL as they can easily return both information about the data updating transaction, as well as the actual data that has changed very easily. One pattern that we recommend to make this consistent is to have a `MutationResponse` interface that can be easily implemented for any `Mutation` fields. The `MutationResponse` is designed to allow transactional information alongside returning valuable data to make client side updates automatic! The interface looks like this:

```graphql
interface MutationResponse {
  code: String!
  success: Boolean!
  message: String!
}
```

An implementing type would look like this:

```graphql
type AddPostMutationResponse implements MutationResponse {
  code: String!
  success: Boolean!
  message: String!
  post: Post
}
```

Let’s break this down by field:

* **code** is a string representing a transactional value explaining details about the status of the data change. Think of this like HTTP status codes.
* **success** is a boolean telling the client if the update was successful. It is a coarse check that makes it easy for the client application to respond to failures
* **message** is a string that is meant to be a human readable description of the status of the transaction. It is intended to be used in the UI of the product
* **post** is added by the implementing type `AddPostMutationResponse` to return back the newly created post for the client to use!

Following this pattern for mutations provides detailed information about the data that has changed and how the operation to change it went! Client developers can easily react to failures and fetch the information they need to update their local cache.