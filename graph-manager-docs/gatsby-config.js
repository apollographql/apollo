const themeOptions = require('gatsby-theme-apollo-docs/theme-options');

module.exports = {
  pathPrefix: '/docs/graph-manager',
  plugins: [
    {
      resolve: 'gatsby-theme-apollo-docs',
      options: {
        ...themeOptions,
        root: __dirname,
        baseDir: 'graph-manager-docs',
        subtitle: 'Graph Manager',
        description: 'How to use Apollo Graph Manager',
        githubRepo: 'apollographql/apollo',
        spectrumPath: '/apollo-platform',
        sidebarCategories: {
          null: [
            'index',
            'getting-started',
            'accounts-organizations',
          ],
          'Schema Management': [
            'schema-registry',
            'schema-validation',
            'schema-reporting-protocol',
          ],
          'Monitoring & Metrics': [
            'setup-analytics',
            'client-awareness',
            'performance',
          ],
          'Managed Federation': [
            'managed-federation/overview',
            'managed-federation/setup',
            'managed-federation/advanced-topics',
          ],
          'Security': [
            'operation-registry',
            'graph-manager-data-privacy',
          ],
          'Integrations': [
            'github-integration',
            'slack-integration',
            'datadog-integration'
          ]
        },
      },
    },
  ],
};
