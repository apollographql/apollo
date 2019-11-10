const themeOptions = require('gatsby-theme-apollo-docs/theme-options');

module.exports = {
  pathPrefix: '/docs',
  plugins: [
    {
      resolve: 'gatsby-theme-apollo-docs',
      options: {
        ...themeOptions,
        root: __dirname,
        subtitle: 'Apollo Basics',
        description: 'How to use the Apollo GraphQL platform',
        githubRepo: 'apollographql/apollo',
        spectrumPath: '/',
        sidebarCategories: {
          null: ['index', 'intro/platform', 'intro/benefits'],
          Tutorial: [
            'tutorial/introduction',
            'tutorial/schema',
            'tutorial/data-source',
            'tutorial/resolvers',
            'tutorial/production',
            'tutorial/client',
            'tutorial/queries',
            'tutorial/mutations',
            'tutorial/local-state',
          ],
          Resources: [
            '[Principled GraphQL](https://principledgraphql.com)',
            'resources/apollo-config',
            'resources/graphql-glossary',
            'resources/faq',
          ],
        },
      },
    },
  ],
};
