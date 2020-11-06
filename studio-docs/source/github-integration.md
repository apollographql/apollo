---
title: Connecting Apollo Studio to GitHub
sidebar_title: Connecting to GitHub
---

To make [schema checks](/schema-checks/) as easy to set up as possible, we've built an Apollo app for GitHub that provides status checks on pull requests when schema changes are proposed.

![GitHub Status View](./img/schema-checks/github-check.png)

## Install the GitHub application

Go to [https://github.com/apps/apollo-studio](https://github.com/apps/apollo-studio) and click the `Configure` button to install the Apollo Studio integration on the GitHub profile or organization that you want to set up checks for.

## Run a check on each commit

Next, make sure your CI has a step to run the schema check command. This is accomplished by adding the `apollo service:check` command directly as a step in your CI. For CircleCI it could look something like this:

### Circle-CI

```yaml{13,29,33-36}:title=.circleci/config.yml
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

      # This will authenticate using the `APOLLO_KEY` environment
      # variable. If the GraphQL server is available elsewhere than
      # http://localhost:4000/graphql, set it with `--endpoint=<URL>`.
      - run: apollo service:check --graph=example-graph --variant=main

      # When running on the 'main' branch, publish the latest version
      # of the schema to Apollo Studio.
      - run: |
          if [ "${CIRCLE_BRANCH}" == "main" ]; then
            apollo service:push
          fi
```

### Github Actions

```yaml:title=.github/workflows/schema_check.yaml
name: Check

# Controls when the action will run. Triggers schema validation on every pull request against main
on:
  pull_request:
    branches: [main]

jobs:
  schema-check:
    # The type of runner that the job will run on any runner with node will work
    runs-on: ubuntu-latest

    # Steps represent a sequence of tasks that will be executed as part of the job
    steps:
      - uses: actions/checkout@v2
        with:
          # Needed along with --commitId=… when the merge commit is checked out;
          # alternatively check out the head of the branch with:
          # ref: ${{ github.event.pull_request.head.sha }}
          fetch-depth: 2

      - name: Run schema check
        env:
          # Apollo Key is supplied as an env var from github secrets
          APOLLO_KEY: ${{ secrets.APOLLO_KEY }}
        run: |
          npx apollo service:check \
            --branch=${GITHUB_REF#refs/heads/} \
            --author=$GITHUB_ACTOR \
            --commitId=$(git rev-parse $GITHUB_SHA^2)
```

> **Note:** Your `apollo service:check` command needs a source from which to fetch your schema. This is most commonly provided as a URL to a running server (with introspection enabled), but can also be provided as a path to a file with your schema in it. See [The schema registry](./schema/registry/) for other options.

The `apollo schema:check` command checks for differences in your schema between what's on your current branch and the last version you uploaded to Apollo Studio. If you've removed or changed any types or fields, it will validate that those changes won't break any of the queries that your clients have made recently. If your changes do break any queries, the check will fail.

Because you installed the Apollo Studio app on GitHub, the check you've added will show up as a line in your GitHub checks list. If there are changes in your schema you'll be able to review them by clicking the "Details" link. By enabling schema checks in your continuous integration workflow (such as CircleCI), you're alerting developers of any potential problems directly in their pull requests, thereby giving them critical feedback where it's most useful.
