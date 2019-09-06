const themeOptions = require('gatsby-theme-apollo-docs/theme-options');

module.exports = {
  pathPrefix: '/docs/platform',
  plugins: [
    {
      resolve: 'gatsby-theme-apollo-docs',
      options: {
        ...themeOptions,
        root: __dirname,
        contentDir: 'graph-manager-docs/source',
        subtitle: 'Graph Manager',
        description: 'How to use Apollo Graph Manager',
        githubRepo: 'apollographql/apollo',
        spectrumPath: 'apollo-platform',
        sidebarCategories: {
          null: [
            'index',
            'schema-registry',
            'schema-validation',
            'client-awareness',
            'operation-registry',
            'editor-plugins',
            'performance',
            'integrations',
            'federation',
          ],
        },
      },
    },
  ],
};
