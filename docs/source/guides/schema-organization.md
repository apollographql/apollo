+---
+title: Schema and Resolver Organization
+description: Organizing your GraphQL schema and resolvers
+---

Once you've built an application around a simple schema, you'll find that as the needs of client applications grow, so will the schema. In this article, we describe ways to keep your codebase clean as your schema and resolvers grow more complex. We'll start with a a simple technique to split your schema and resolvers across multiple files, talk about a useful GraphQL feature called `extend`, delve into the context object and end with models. By the end of the article, you should come away with a solid understanding of how to manage your GraphQL server codebase so that you aren't rearranging sphagetti with every commit. 


# Schema Modularization

As your schema and resolvers grow, you may want to split them across multiple files. If you're building a demo or a proof of concept application, schema modularization shouldn't be a priority. But as soon as you're working with multiple people on a production application, modularization becomes very appealing. The Javascript module system is highly flexible, so there are a lot of paths to the finish line, some more elegant and effective than others. Here, we outline a simple, no-fancy-tricks method based on `graphql-tools`. 

When you're starting out, you probably have a single file that contains your entire schema and resolvers. We call it `schema.js` and it might look like this:

```
// schema.js

import { makeExecutableSchema} from 'graphql-tools';

const typeDefs = gql`
  type Query {
    author(id: Int!): Post
    book(id: Int!): Post
  }

  type Author {
    id: Int!
    firstName: String
    lastName: String
    books: [Book]
  }

  type Book {
    title: String
    author: Author
  }
`;

makeExecutableSchema({
  typeDefs,
  resolvers: {}
});
```

We're using the GraphQL Schema Definition Language (SDL) to define our schema here. But at the end of the day, `typeDefs` is a just a string. We can import and export it around different files just like we would with any other string. Moreover, we can concatenate different strings to pull together our full schema definition. We'll use this idea to write `author.js` and `book.js` such that each file contains the type definitions for the relevant types. Then, `schema.js` will pull everything together.

Here's `author.js`:

```
export const typeDef = gql`
  type Author {
    id: Int!
    firstName: String
    lastName: String
    books: [Book]
  }
`;
```

Here's `book.js`:

```
export const typeDef = gql`
  type Book {
    title: String
    author: Author
  }
`;
```

And here's `schema.js`:

```
// schema.js

import { makeExecutableSchema} from 'graphql-tools';
import { typeDef as Author } from 'graphql-tools';
import { typeDef as Book } from './book.js';

const Query = gql`
  type Query {
    author(id: Int!): Post
    book(id: Int!): Post
  }
`;

makeExecutableSchema({
  typeDefs: [ Query, Author, Book ],
  resolvers: {},
});
```

Notice that we're passing an array to the `typeDefs` property within the object passed to `makeExecutableSchema`. This is just a convenience feature that removes the need for us to concatenate the strings we're importing. All vanilla Javascript and strings - nothing fancy.

So far, we haven't dealt with the resolvers. Our `schema.js` after splitting the schema into `book.js` and `author.js` with resolvers tacked on might look like:

```
import { makeExecutableSchema} from 'graphql-tools';
import { typeDef as Author } from 'graphql-tools';
import { typeDef as Book } from './book.js';

const Query = gql`
  type Query {
    author(id: Int!): Post
    book(id: Int!): Post
  }
`;

const resolvers = {
  Query: {
    author: () => { ... },
    book: () => { ... },
  },
  Author: {
    name: () => { ... },
  },
  Book: {
    title: () => { ... },
  },
};

makeExecutableSchema({
  typeDefs: [ Query, Author, Book ],
  resolvers,
});
```

Notice that `resolvers` isn't anything particularly fancy either: it's just a Javascript object that has some functions as values. To put the relevant resolvers in `book.js` and `author.js`, we can define objects in each file and then merge them together in `schema.js`. 

Here's `author.js` with the schema and relevant resolvers:

```
// author.js

export const typeDef = gql`
  type Author {
    id: Int!
    firstName: String
    lastName: String
    books: [Book]
  }`;
export const resolvers = {
  Author: {
    books: () => { ... },
  }
};
```

And this is `book.js`:

```
// book.js

export const typeDef = gql`
  type Book {
    title: String
    author: Author
  }
`;

export const resolvers = {
  Book: {
    author: () => { ... },
  }
};  
```

Applying some `lodash.merge` magic in `schema.js` gives us:

```
// schema.js
import { merge } from 'lodash';
import { makeExecutableSchema} from 'graphql-tools';
import {
  typeDef as Author,
  resolvers as authorResolvers,
} from './author.js';

import {
  typeDef as Book,
  resolvers as bookResolvers,
} from './book.js';

const Query = gql`
  type Query {
    author(id: Int!): Author
    book(id: Int!): Book
  }
`;

const resolvers = {
  Query: {
    author(...) => { ... },
    book(...) => { ... }
  },
}

makeExecutableSchema({
  typeDefs: [ Query, Author, Book],
  resolvers: merge(resolvers, authorResolvers, bookResolvers),
});
```

There we have it: we're able to merge the resolver object together across multiple files. We still have a bit of weirdness here. We've defined the resolvers `author(id: Int!)` and `book(id:Int!)` on the root `Query` type. But, these resolvers should probably live in `book.js` and `author.js` since they have more to do with the `Book` and `Author` types than with the root `Query` type. 

# Type Extensions 

We can solve this using the `extend` keyword available in the GraphQL Schema Definition Language. In essence, `extend` allows us to define a type in multiple pieces. For example, these two definitions are (nearly) equivalent:

```
// definition 1
const typeDef = gql`
  type Query {
    author(id: Int!): Author
    book (id: Int!): Author
  }`;

// definition 2
const typeDef = gql`
  type Query {
    _empty 
  }

  extend type Query {
    author(id: Int!): Author
  }

  extend type Query {
    book(id: Book!): Book  
  }
`;
```

Basically, the `extend` keyword lets us tack on fields to types we have already defined. We have to add the `_empty` resolver in the second case because the GraphQL specification doesn't currently allow us to define a type without any fields associated with it - hopefully this will change in the future. 

We can take advantage of this fact in order to split up the resolvers on Query into their respective places in `book.js` and `author.js`. This is `author.js`: 

```
// author.js

export const typeDef = gql`
  extend type Query {
    author(id: Int!): Author
  }
  type Author {
    id: Int!
    firstName: String
    lastName: String
    books: [Book]
  }`;

export const resolvers = {
  Query: {
    author: () => { ... },
  },

  Author: {
    books: () => { ... },
  }
};
```

In addition to using `extend`, we've also moved the resolver implementation for `Query.author` into `author.js`. We do basically the same thing in `book.js`:

```
// book.js
export const typeDef = gql`
  extend type Query {
    book(id: Int!): Book
  }
  type Book {
    title: String
    author: Author
  }`;

export const resolvers = {
  Query: {
    book: () => { ... },
  },
  Book: {
    author: () => { ... },
  }
};
```

Finally, we have `schema.js`:

```
// schema.js
// schema.js
import { merge } from 'lodash';
import { makeExecutableSchema} from 'graphql-tools';
import {
  typeDef as Author,
  resolvers as authorResolvers,
} from './author.js';

import {
  typeDef as Book,
  resolvers as bookResolvers,
} from './book.js';

const Query = gql`
  type Query {
    _empty
  }
`;

const resolvers = {};

export const schema = makeExecutableSchema({
  typeDefs: [ Query, Author, Book],
  resolvers: merge(resolvers, authorResolvers, bookResolvers),
});

```

Other than the eyesore that `_empty` is, this looks like a pretty nice way to split up your schema and resolvers!

# Best Practices with Modularization

There are a few things to keep in mind when modularizing your schema and resolvers. 

1. **Don't modularize too soon.** Being able to fit all of your schema and resolver code into a single file has its benefits: quick navigation and a simpler mental model of the schema. When you're building a demo or proof of concept, it might be fine to just leave your schema in one file - you can consider splitting up later if need be.

2. **Organize by feature.** It makes sense to organize your schema and resolvers around different concepts and features. For example, grouping together stuff related to posts might make sense for a social networking app. 

3. **Co-locate resolvers and schema definitions.** Put the resolvers in the same file as the types that they relate to - this will allow you to think about your GraphQL server code effectively.

4. **Use gql.** If you wrap your type-definitions with the `gql` tag from `graphql-tools`, you'll be able to take advantage of code highlighting and editor integrations for the GraphQL Schema Definition Language.


# Context Object

So far, we've been talking about how we can modularize the schema and resolvers to keep your code clean. Now, we'll take a look at the `context` argument to resolvers that, when used correctly, allows us to write clean, elegant resolvers.
Let's say that we're to implement the resolver for the `authors(id: Int!): Author` field on the `Query` type. From the basics of writing resolvers, we know that this function should look like this:

```
// inside author.js

const resolvers = {
  Query: {
    author: (obj, args, context) => {
      // something goes on here that we have to fill in
      return author; 
    },
  },
};
```

Let's say that we have a database connection object that we would like to use in order to look up the `author` object and we initialize this connection object when the server instance is started. How can we manage that? That's one place where the `context` object comes in handy. If you're using Apollo Server, you probably have a file like `server.js` where you initialize Apollo Server. This might look like this (where `schema.js` is the same as as our last example above):

```
// server.js, with Apollo Server 1.x
import { graphqlExpress } from 'apollo-server-express';
import { schema } from './schema.js';

app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));
```

We might initialize the database connection in this file like so:

```
// server.js, with Apollo Server 1.x
import { graphqlExpress } from 'apollo-server-express';
import { schema } from './schema.js';

const db = getDB();

app.use('/graphql', bodyParser.json(), graphqlExpress({ 
  schema,
  context: { db },
}));
```

Now, we can tack on that object onto the context that we can pass to `graphqlExpress`: 

```
// server.js, with Apollo Server 1.x
import { graphqlExpress } from 'apollo-server-express';
import { schema } from './schema.js';

const db = getDB();

app.use('/graphql', bodyParser.json(), graphqlExpress({ 
  schema,
  context: { db },
}));
```

Now, this `db` object will be available to us within the `context` object in the resolver implementation. So, we might write something like this:

```
const resolvers = {
  Query: {
    author: (obj, args, context) => {
      return context.db.execute('SELECT * FROM authors WHERE id=?', args.id);
    },
  },
};
```

So the `context` object allows us to solve problem: maintaining state across different resolvers. You can check out the [authorization guide][TODO I don't know how to link] for more examples of the context object in action. Let's turn our attention to this line:

```
return db.execute('SELECT * FROM authors WHERE id=?', args.id);
```

Imagine that `db.execute` returns the contents of the `authors` table with the given `id` as an array. It's pretty evident this is an ugly solution: we're slapped some SQL in within the GraphQL resolver and our downstream resolvers (e.g. `name` on `Author`, if such a field were added later on) are going to be really dependent on the database schema. Instead, we can organize our resolvers around models.

   
# Models

Ideally, our code for the resolver should look something like this:

```
import { AuthorModel } from './models/author';

const resolvers = {
  Query: {
    author: (obj, args, context) => {
      return AuthorModel.find(args.id, context);
    },
  },
};
```

Our `AuthorModel` object can be written as:

```
export const AuthorModel = {
  find: (id, context) {
    const dbResult = context.db.execute('SELECT * FROM authors WHERE id=?', id);  
    return new Author(dbResult);  
  }
};
```

where `Author` is a simple data class that contains properties of authors we care about. You might ask: what's the benefit of doing this? Now, we're no longer stuffing our GraphQL resolvers full of logic that's dependent on the database that we're using or the schema within the database. Instead, all the resolvers have to care about is the `Author` object. For example, let's say our `Author` GraphQL type has a `name` type. We may now implement this resolver as:

```
const resolvers = {
  Query: {
    author: (obj, args, context) => {
      return AuthorModel.find(args.id, context);
    },
  },
  Author: {
    name: (obj, args, context) => {
      return obj.name;
    },
  },
};
```

In fact, we can actually completely omit the `name` resolver because it's a trivial resolver. In a few words, the model approach allows us to have clean separation of concerns amongst our GraphQL resolvers, business logic and database-dependent code.

  
