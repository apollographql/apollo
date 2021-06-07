const themeOptions = require('gatsby-theme-apollo-docs/theme-options');

module.exports = {
  plugins: [
    {
      resolve: 'gatsby-theme-apollo-docs',
      options: {
        ...themeOptions,
        root: __dirname,
        pathPrefix: '/docs',
        subtitle: 'Apollo Basics',
        description: 'How to use the Apollo GraphQL platform',
        githubRepo: 'apollographql/apollo',
        spectrumPath: '/',
        sidebarCategories: {
          null: [
            'index',
            'intro/platform',
            'intro/benefits',
            '[Guided tutorials](https://odyssey.apollographql.com/?utm_source=apollo_docs&utm_medium=referral&utm_campaign=docs_sidebar)'
          ],
          'Full-Stack Tutorial': [
            'tutorial/introduction',
            'tutorial/schema',
            'tutorial/data-source',
            'tutorial/resolvers',
            'tutorial/mutation-resolvers',
            'tutorial/production',
            'tutorial/client',
            'tutorial/queries',
            'tutorial/mutations',
            'tutorial/local-state'
          ],
          'Development Tools': [
            '[Rover CLI](https://www.apollographql.com/docs/rover)',
            'devtools/cli',
            'devtools/editor-plugins',
            'devtools/apollo-config'
          ],
          Resources: [
            '[Principled GraphQL](https://principledgraphql.com)',
            'resources/graphql-glossary',
            'resources/faq',
            'resources/release-stages',
          ],
        },
      },
    },
  ],
};
