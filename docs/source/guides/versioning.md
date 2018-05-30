---
title: API versioning
description: Everything you need to know about evolving your GraphQL schema
---

Versioning is a technique to prevent necessary changes from affecting the existing consumers of an API.  These so-called “breaking changes” might be as trivial as renaming a field or as substantial as refactoring the whole data model.

Developers who have worked with REST APIs in the past have probably recognized various patterns for versioning the API, commonly by using a different URI (e.g. `/api/v1`, `/api/v2`, etc.) or a query parameter (e.g. `?version=1`).

It’s certainly responsible to consider versioning a GraphQL API in a similar fashion, but luckily  GraphQL APIs don't need the same type of  versioning and, assuming the correct strategies and precautions are observed, are able to serve various iterations on an API from a single endpoint.

<h2 id="field-usage">Understanding field usage</h2>

Thanks to its field-based granularity, GraphQL simplifies the process of determining which fields are getting used by a particular client.  By using API management tools like [Apollo Engine](https://www.apollographql.com/engine), it becomes possible to see exactly when a field was last used.

The power of such usage metrics becomes incredibly valuable when determining whether it’s possible to safely deprecate fields while updating an API.  Without this information, it’s hard to confidently deprecate a field.

<h2 id="additive">Additive changes</h2>

Since GraphQL clients only receive exactly what they ask for, adding new fields, arguments, queries, or mutations won't introduce any new breaking changes and these changes can be confidently made without careful consideration.

<h2 id="field-rollover">Field rollover</h2>

_Field rollover_ is a term given to an API change that's an evolution of a field, such as a rename or a change in arguments. Some of these changes can be really small, so versioning for any such change could create many versions quickly, and make an API hard to manage. We'll go over these two kinds of field rollovers separately and show how to make these changes safely.

<h3 id="renaming-or-removing">Renaming or removing a field</h3>

Consider the following `user` query as an example:

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

Even if that was the only change, this would be a breaking change for some clients, since those  expecting a `user` query would receive error.

To make this change safely, instead of renaming the existing field we can simply add a new `getUser` field and leave the existing  `user` field untouched. To prevent code duplication, the  resolver logic can be shared between the two fields:

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

GraphQL-aware tools, like GraphQL Playground and GraphiQL, use this information to assist developers in making the right choices.  These tools will:

* Provide developers the helpful deprecation message which instructs them to use the new name.
* Avoid auto-completing the field.

<h3 id="retiring">Retiring a deprecated field</h3>

Over time, usage will fall for the deprecated field and grow for the new field. Using tools like [Apollo Engine](https://www.apollographql.com/engine), it’s possible to make educated decisions about when to retire a field based on actual usage data.

<h2 id="arguments">Changing arguments</h2>

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
type query = {
  # What we have.
  getUsers(ids: [ID!], groupId: ID!): [User]!

  # What we want to end up with.
  getUsers(ids: [ID!], groupIds: [ID!]): [User]!
}
```

There's no way to mark an argument as deprecated, but there are a couple options.

If we wanted to leave the old `groupId` argument active, we wouldn't need to do anything; adding a new argument isn't a breaking change as long as existing functionality doesn't change.

Instead of supporting it, if we wanted to remove the old argument, the safest option would be to create a new field and deprecate the current `getUsers` field.

Using an API management tool, like [Apollo Engine](https://www.apollographql.com/engine), it’s possible to determine when usage of an old field has dropped to an acceptable level and remove it and the earlier [field rollover](#field-rollover) section gives more info on how to do that.

Of course, it’s also possible to leave the field in place indefinitely!