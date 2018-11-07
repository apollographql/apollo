---
title: Schema design
description: How to structure your GraphQL types, fields, and arguments
---

One of the main aspects of GraphQL is that it allows you to describe the space of data available in your system with a strongly typed schema. While GraphQL makes it possible to evolve your API over time without breaking your clients, it's always easier if you think about some schema design decisions up front to reduce the amount of refactoring you need to do later.

This article details some practices around schema design which will help you design a great GraphQL API to stand the test of time.

<h2 id="design-for-client">Designing for client needs</h2>

GraphQL schemas are at their best when they are designed around the needs of client applications.  When a team is building their first GraphQL schema, they might be tempted to create literal mappings on top of existing database collections or tables using CRUD-like root fields. While this literal database-to-schema mapping may be a fast way to get up and running, we strongly suggest avoiding it and instead building the schema around based on how the GraphQL API will be used by the front-end.

If a database has fields or relationships that the client doesn't yet need, don’t include them in the schema up front. Adding fields later is much easier than removing them, so add fields to your API as your clients need them rather than exposing all of the possible data up front. This is especially useful because GraphQL allows you to create associations between your data that don't exist in the underlying data, enabling you to move complex data manipulation logic out of your clients.

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

The `Mutation` type is a core type in GraphQL which specializes in _modifying_ data, which contrasts the `Query` type used for _fetching_ data.

Unlike REST, where the behavior can be more ad-hoc, the `Mutation` type is designed with the expectation that there will be a response object.  This ensures that the client receives the most current data without a subsequent round-trip re-query.

A mutation for updating the age of a `User` might look like this:

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

With this definition, the following mutation becomes possible:

```graphql
mutation updateMyUser {
  updateUserAge(id: 1, age: 25){
    id
    age
    name
  }
}
```

Once executed by the server, the response returned to the client might be:

```json
{
  "data": {
    "updateUserAge": {
      "id": "1",
      "age": "25",
      "name": "Jane Doe"
    }
  }
}
```

While it's not mandatory to return the object which has been updated, the inclusion of the updated information allows the client to confidently update its local state without performing additional requests.

As with queries, it's best to design mutations with the client in mind and in response to a user's action.  In simple cases, this might only result in changes to a single document, however in many cases there will be updates to multiple documents from different resources, for example, a `likePost` mutation might update the total likes for a user as well as their post.

In order to provide a consistent shape of response data, we recommend adopting a pattern which returns a standardized response format which supports returning any number of documents from each resource which was modified.  We'll outline a recommended patterns for this in the next section.

<h3 id="mutation-responses">Responses</h3>

GraphQL mutations can return any information the developer wishes, but designing mutation responses in a consistent and robust structure makes them more approachable by humans and less complicated to traverse in client code.  There are two guiding principles which we have combined into our suggested mutation response structure.

First, while mutations might only modify a single resource type, they often need to touch several at a time.  It makes sense for this to happen in a single round-trip to the server and this is one of the strengths of GraphQL!  When different resources are modified, the client code can benefit from having updated fields returned from each type and the response format should support that.

Secondly, mutations have a higher chance of causing errors than queries since they are modifying data.  If only a portion of a mutation update succeeds, whether that is a partial update to a single document's fields or a failed update to an entire document, it's important to convey that information to the client to avoid stale local state on the client.

A common way to handle errors during a mutation is to simply `throw` an error.  While that's fine, throwing an error in a resolver will return an error for the entire operation to the caller and prevent a more meaningful response.  Consider the following mutation example, which tries to update a user's `name` and `age`:

```graphql
mutation updateUser {
  updateUser(id: 1, user: { age: -1, name: "Foo Bar" }){
    name
    age
  }
}
```

With validation in place, this mutation might cause an error since the `age` is a negative value.  While it’s possible that the entire operation should be stopped, there’s an opportunity to partially update the user’s record with the new `name` and return the updated record with the `age` left untouched.

Fortunately, the powerful structure of GraphQL mutations accommodates this use case and can return transactional information about the update alongside the records which have been changed which enables client-side updates to occur automatically.

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

For mutations which have touched multiple types, this same structure can be used to return updated objects from each one.  For example, a `likePost` type, which could affect a user's "reputation" and also update the post itself, might implement `MutationResponse` in the following manner:

```graphql
type LikePostMutationResponse implements MutationResponse {
  code: String!
  success: Boolean!
  message: String!
  post: Post
  user: User
}
```

In this response type, we've provided the expectation that both the `user` and the `post` would be returned and an actual response to a `likePost` mutation could be:

```json
{
  "data": {
    "likePost": {
      "code": "200",
      "success": true,
      "message": "Thanks!",
      "post": {
        "likes": 5040
      },
      "user": {
        "reputation": 11
      }
    }
  }
}
```

Following this pattern for mutations provides detailed information about the data that has changed and feedback on whether the operation was successful or not.  Armed with this information, developers can easily react to failures within the client

<h3 id="mutation-input-types">Input types</h3>

Input types are a special type in GraphQL which allows an object to be passed as an argument to both queries and mutations and is helpful when simple scalar types aren't sufficient.

This allows arguments to be structured in an more manageable way, similar to how switching to an `options` argument might be appreciated when `function` arguments become too iterative.

For example, consider this mutation which creates a post along with its accompanying media URLs (e.g. images):

```graphql
type Mutation {
  createPost(title: String, body: String, mediaUrls: [String]): Post
}
```

This could be easier to digest, and the arguments would be easier to re-use within the mutation, by using an `input` type with the relevant fields.

An input type is defined like a normal object type but using the `input` keyword.  To introduce an `input` type for this example, we'd do:

```graphql
type Mutation {
  createPost(post: PostAndMediaInput): Post
}

input PostAndMediaInput {
  title: String
  body: String
  mediaUrls: [String]
}
```

Not only does this facilitate passing the `PostAndMediaInput` around within the schema, it also provides a basis for annotating fields with descriptions which are automatically exposed by GraphQL-enabled tools:

```graphql
input PostAndMediaInput {
  "A main title for the post"
  title: String
  "The textual body of the post."
  body: String
  "A list of URLs to render in the post."
  mediaUrls: [String]
}
```

Input types can also be used when different operations require the exact same information, though we urge caution on over-using this technique since changes to `input` types are breaking changes for all operations which utilize them.

Additionally, while it is possible to reuse an `input` type between a query and mutation which target the same resource, it's often best to avoid this since in many cases certain null fields might be tolerated for one but not the other.

<h2 id="versioning">Schema versioning</h2>

Versioning is a technique to prevent necessary changes from becoming "breaking changes" which affect the existing consumers of an API.  These iterations might be as trivial as renaming a field, or as substantial as refactoring the whole data model.

Developers who have worked with REST APIs in the past have probably recognized various patterns for versioning the API, commonly by using a different URI (e.g. `/api/v1`, `/api/v2`, etc.) or a query parameter (e.g. `?version=1`).  With this technique, an application can easily end up with many different API endpoints over time, and the question of _when_ an API can be deprecated can become problematic.

It might be tempting to version a GraphQL API the same way, but it's unnecessary with the right techniques.  By following the strategies and precautions outlined in this guide and using Apollo tooling that adds clarity to every change, many iterations of an API can be served from a single endpoint.

<h3 id="field-usage">Understanding field usage</h3>

Rather than returning extensive amounts of data which might not be necessary, GraphQL allows consumers to specify exactly what data they need.  This field-based granularity is valuable and avoids "over-fetching" but also makes it more difficult to understand what data is currently being used.

To improve the understanding of field usage within an API, Apollo Server extends GraphQL with rich tracing data that demonstrates _how_ a GraphQL field is used and _when_ it's safe to change or eliminate a field.

> For details on how tracing data can be used to avoid shipping breaking changes to clients, check out the [schema history](https://www.apollographql.com/docs/engine/schema-history.html) tooling in [Apollo Engine](https://www.apollographql.com/engine) which utilizes actual usage data to provide warnings and notices about changes that might break existing clients.

Since GraphQL clients only receive exactly what they ask for, adding new fields, arguments, queries, or mutations won't introduce any new breaking changes and these changes can be confidently made without consideration about existing clients or field usage metrics.

_Field rollover_ is a term given to an API change that's an evolution of a field, such as a rename or a change in arguments. Some of these changes can be really small, resulting in many variations and making an API harder to manage.

We'll go over these two kinds of field rollovers separately and show how to make these changes safely.

<h3 id="renaming-or-removing">Renaming or removing a field</h3>

When a field is unused, renaming or removing it is as straightforward as it sounds: it can be renamed or removed.  Unfortunately, if a GraphQL deployment doesn't have per-field usage metrics, additional considerations should be made.

Take the following `user` query as an example:

```graphql
type Query {
 user(id: ID!): User
}
```

We may want to rename it to `getUser` to be more descriptive of what the query is for, like so:

```graphql
type Query {
  getUser(id: ID!): User
}
```

Even if that was the only change, this would be a breaking change for some clients, since those expecting a `user` query would receive error.

To make this change safely, instead of renaming the existing field we can simply add a new `getUser` field and leave the existing `user` field untouched. To prevent code duplication, the resolver logic can be shared between the two fields:

```js
const getUserResolver = (root, args, context) => {
  context.User.getById(args.id);
};

const resolvers = {
  Query: {
    getUser: getUserResolver,
    user: getUserResolver,
  },
};
```

<h3 id="deprecating">Deprecating a field</h3>

The tactic we used works well to avoid breaking changes, but we still haven’t provided a way for consumers to know that they should switch to using the new field name. Luckily, the GraphQL specification provides a built-in `@deprecated` schema directive (sometimes called decorators in other languages):

```
type Query {
  user(id: ID!): User @deprecated(reason: "renamed to 'getUser'")
  getUser(id: ID!): User
}
```

GraphQL-aware client tooling, like GraphQL Playground and GraphiQL, use this information to assist developers in making the right choices.  These tools will:

* Provide developers with the helpful deprecation message referring them to the new name.
* Avoid auto-completing the field.

Over time, usage will fall for the deprecated field and grow for the new field.

> Using tools like [Apollo Engine](https://www.apollographql.com/engine), it’s possible to make educated decisions about when to retire a field based on actual usage data through [schema analytics](https://www.apollographql.com/docs/engine/schema-analytics.html).

<h3 id="non-breaking">Non-breaking changes</h3>

Sometimes we want to keep a field, but change how clients use it by adjusting its variables. For example, if we had a `getUsers` query that we used to fetch user data based off of a list of user `ids`, but wanted to change the arguments to support a `groupId` to look up users of a group or filter the users requested by the `ids` argument to only return users in the group:

```graphql
type Query {
  # what we have
  getUsers(ids: [ID!]!): [User]!

  # what we want to end up with
  getUsers(ids: [ID!], groupId: ID!): [User]!
}
```

Since this is an _additive_ change, and doesn't actually change the default behavior of the `getUsers` query, this isn't a breaking change!

<h3 id="breaking">Breaking changes</h3>

An example of a breaking change on an argument would be renaming (or deleting) an argument.

```graphql
type Query {
  # What we have.
  getUsers(ids: [ID!], groupId: ID!): [User]!

  # What we want to end up with.
  getUsers(ids: [ID!], groupIds: [ID!]): [User]!
}
```

There's no way to mark an argument as deprecated, but there are a couple options.

If we wanted to leave the old `groupId` argument active, we wouldn't need to do anything; adding a new argument isn't a breaking change as long as existing functionality doesn't change.

Instead of supporting it, if we wanted to remove the old argument, the safest option would be to create a new field and deprecate the current `getUsers` field.

Using an API management tool, like [Apollo Engine](https://www.apollographql.com/engine), it’s possible to determine when usage of an old field has dropped to an acceptable level and remove it.  The previously discussed [field rollover](#field-rollover) section gives more info on how to do that.

Of course, it’s also possible to leave the field in place indefinitely!