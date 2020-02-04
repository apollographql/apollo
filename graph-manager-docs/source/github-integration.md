---
title: Integrating Graph Manager with GitHub
sidebar_title: GitHub
---

To make [schema change validation](/schema-validation/) as easy to set up as possible, we've built an Apollo app for GitHub that provides status checks on pull requests when schema changes are proposed.

![GitHub Status View](./img/schema-validation/github-check.png)

## Install the GitHub application

Go to [https://github.com/apps/apollo-engine](https://github.com/apps/apollo-engine) and click the `Configure` button to install the Apollo Graph Manager integration on the GitHub profile or organization that you want to set up checks for.

## Run validation on each commit

Next, make sure your CI has a step to run the schema validation command. This is accomplished by adding the `apollo schema:check` command directly as a step in your CI. For CircleCI it could look something like this:

```yaml{13,29,33-36}
version: 2

jobs:
  build:
    docker:
      - image: circleci/node:8

    steps:
      - checkout

      - run: npm install
      # CircleCI needs global installs to be sudo
      - run: sudo npm install --global apollo

      # Start the GraphQL server.  If a different command is used to
      # start the server, use it in place of `npm start` here.
      - run:
          name: Starting server
          command: npm start
          background: true

      # make sure the server has enough time to start up before running
      # commands against it
      - run: sleep 5

      # This will authenticate using the `ENGINE_API_KEY` environment
      # variable. If the GraphQL server is available elsewhere than
      # http://localhost:4000/graphql, set it with `--endpoint=<URL>`.
      - run: apollo service:check

      # When running on the 'master' branch, publish the latest version
      # of the schema to Apollo Graph Manager.
      - run: |
          if [ "${CIRCLE_BRANCH}" == "master" ]; then
            apollo service:push
          fi
```

> **Note:** Your `apollo service:check` command needs a source to from which to fetch your schema. This is most commonly provided as a URL to a running server (with introspection enabled), but can also be provided as a path to a file with your schema in it. See [The schema registry](/schema-registry/) for other options.

The `apollo schema:check` command checks for differences in your schema between what's on your current branch and the last version you uploaded to Graph Manager. If you've removed or changed any types or fields, it will validate that those changes won't break any of the queries that your clients have made recently. If your changes do break any queries, the check will fail.

Because you installed the Graph Manager app on GitHub, the check you've added will show up as a line in your GitHub checks list. If there are changes in your schema you'll be able to review them by clicking the "Details" link. By enabling schema validation in your continuous integration workflow (eg. CircleCI, etc.), you're alerting developers of any potential problems directly in their pull requests, thereby giving them critical feedback where it's most useful.
