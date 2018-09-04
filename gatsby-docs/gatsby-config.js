const sidebar = {
  sections: [
    // root section
    {
      title: null,
      items: [
        {
          title: 'Welcome',
          href: '/index',
          relative: true,
        },
      ],
    },
    {
      title: 'Fundamentals',
      items: [
        { title: 'Platform', href: '/fundamentals/platform', relative: true },
        { title: 'Benefits', href: '/fundamentals/benefits', relative: true },
        { title: 'Tips', href: '/fundamentals/tips', relative: true },
      ],
    },
    {
      title: 'Resources',
      items: [
        {
          title: 'GraphQL Glossary',
          href: '/resources/graphql-glossary',
          relative: true,
        },
        {
          title: 'Frequently Asked Questions',
          href: '/resources/faq',
          relative: true,
        },
      ],
    },
    {
      title: 'Guides',
      items: [
        { title: 'Security', href: '/guides/security', relative: true },
        { title: 'Versioning', href: '/guides/versioning', relative: true },
        { title: 'Monitoring', href: '/guides/monitoring', relative: true },
        { title: 'Performance', href: '/guides/performance', relative: true },
        { title: 'File Uploads', href: '/guides/file-uploads', relative: true },
        {
          title: 'Schema Design',
          href: '/guides/schema-design',
          relative: true,
        },
        {
          title: 'Access Control',
          href: '/guides/access-control',
          relative: true,
        },
        {
          title: 'State Management',
          href: '/guides/state-management',
          relative: true,
        },
        {
          title: 'Testing React Components',
          href: '/guides/testing-react-components',
          relative: true,
        },
      ],
    },
    {
      title: 'Documentation',
      items: [
        {
          title: 'Apollo Client',
          href: 'https://www.apollographql.com/docs/react/',
        },
        {
          title: 'Apollo Server',
          href: 'https://www.apollographql.com/docs/apollo-server/v2/',
        },
        {
          title: 'Apollo Engine',
          href: 'https://www.apollographql.com/docs/engine/',
        },
      ],
    },
  ],
}

const navItems = [
  {
    title: 'Home',
    href: '/',
    class: '',
    children: [],
  },
  {
    title: 'Client',
    href: '/client',
    class: 'client',
    children: [
      {
        title: 'React + React Native',
        href: 'https://www.apollographql.com/docs/react/',
      },
      {
        title: 'Angular',
        href: 'https://www.apollographql.com/docs/angular',
      },
      {
        title: 'Vue.js',
        href: 'https://github.com/akryum/vue-apollo',
        newPage: true,
      },
      {
        title: 'Apollo Link',
        href: 'https://www.apollographql.com/docs/link',
      },
      {
        title: 'Native iOS',
        href: 'https://www.apollographql.com/docs/ios',
      },
      {
        title: 'Native Android',
        href: 'https://github.com/apollographql/apollo-android',
        newPage: true,
      },
      {
        title: 'Scala.js',
        href: 'https://www.apollographql.com/docs/scalajs',
      },
    ],
  },

  {
    title: 'Engine',
    href: '/engine',
    class: 'engine',
    children: [
      {
        title: 'Features',
        href: '/engine',
      },
      {
        title: 'Setup',
        href: 'https://www.apollographql.com/docs/engine/setup-node.html',
      },
      {
        title: 'Performance Tracing',
        href: 'https://www.apollographql.com/docs/engine/performance.html',
      },
      {
        title: 'Caching',
        href: 'https://www.apollographql.com/docs/engine/caching.html',
      },
      {
        title: 'Error Tracking',
        href: 'https://www.apollographql.com/docs/engine/error-tracking.html',
      },
    ],
  },

  {
    title: 'Server',
    href: '/server',
    class: 'server',
    children: [
      {
        title: 'Apollo Server',
        href: 'https://www.apollographql.com/docs/apollo-server/',
      },
      {
        title: 'graphql-tools',
        href: 'https://www.apollographql.com/docs/graphql-tools/',
      },
      {
        title: 'Schema Stitching',
        href:
          'https://www.apollographql.com/docs/graphql-tools/schema-stitching.html',
      },
      {
        title: 'GraphQL Subscriptions',
        href: 'https://www.apollographql.com/docs/graphql-subscriptions/',
      },
    ],
  },

  {
    title: 'Docs',
    href: '/docs',
    class: 'docs',
    children: [
      {
        subheading: 'Client',
        children: [
          {
            title: 'React + React Native',
            href: 'https://www.apollographql.com/docs/react',
          },
          {
            title: 'Angular',
            href: 'https://www.apollographql.com/docs/angular',
          },
          {
            title: 'Vue.js',
            href: 'https://github.com/akryum/vue-apollo',
            newPage: true,
          },
          {
            title: 'Apollo Link',
            href: 'https://www.apollographql.com/docs/link',
          },
          {
            title: 'Native iOS',
            href: 'https://www.apollographql.com/docs/ios',
          },
          {
            title: 'Native Android',
            href: 'https://github.com/apollographql/apollo-android',
            newPage: true,
          },
          {
            title: 'Scala.js',
            href: 'https://www.apollographql.com/docs/scalajs',
          },
        ],
      },
      {
        subheading: 'Engine',
        children: [
          {
            title: 'Setup',
            href: 'https://www.apollographql.com/docs/engine/setup-node.html',
          },
          {
            title: 'Performance Tracing',
            href: 'https://www.apollographql.com/docs/engine',
          },
          {
            title: 'Caching',
            href: 'https://www.apollographql.com/docs/engine',
          },
          {
            title: 'Error Tracking',
            href: 'https://www.apollographql.com/docs/engine',
          },
        ],
      },
      {
        subheading: 'Server',
        children: [
          {
            title: 'Apollo Server',
            href: 'https://www.apollographql.com/docs/apollo-server',
          },
          {
            title: 'graphql-tools',
            href: 'https://www.apollographql.com/docs/graphql-tools',
          },
          {
            title: 'Schema Stitching',
            href:
              'https://www.apollographql.com/docs/graphql-tools/schema-stitching.html',
          },
          {
            title: 'GraphQL Subscriptions',
            href: 'https://www.apollographql.com/docs/graphql-subscriptions',
          },
        ],
      },
    ],
  },

  {
    title: 'Support',
    href: '/support',
    class: 'support',
  },

  {
    title: 'Careers',
    href: '/careers',
    class: 'careers',
    children: [
      {
        title: 'Careers',
        href: '/careers',
      },
      {
        title: 'Open Positions',
        href: '/careers/positions',
      },
      {
        title: 'Culture',
        href: '/careers/culture',
      },
      {
        title: 'Team',
        href: '/careers/team',
      },
      {
        title: 'Interns',
        href: '/careers/interns',
      },
    ],
  },

  {
    title: 'Community',
    href: '/docs/community',
    class: 'community',
    children: [
      {
        subheading: 'Social',
        children: [
          {
            title: 'Blog',
            href: 'https://dev-blog.apollodata.com/',
            newPage: true,
          },
          {
            title: 'Slack',
            href: '/slack',
          },
          {
            title: 'Twitter',
            href: 'https://twitter.com/apollographql',
            newPage: true,
          },
          {
            title: 'YouTube',
            href: 'https://www.youtube.com/c/ApolloGraphQL',
            newPage: true,
          },
        ],
      },
      {
        subheading: 'Get involved',
        children: [
          {
            title: 'Contribute',
            href: 'https://www.apollographql.com/docs/community/',
          },
          {
            title: 'GraphQL Summit',
            href: 'https://summit.graphql.com/',
            newPage: true,
          },
          {
            title: 'Explore GraphQL',
            href: 'https://www.graphql.com/',
            newPage: true,
          },
        ],
      },
    ],
  },
]

module.exports = {
  siteMetadata: {
    title: 'Gatsby Default Starter',
    navItems,
    sidebar,
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: 'gatsby-starter-default',
        short_name: 'starter',
        start_url: '/',
        background_color: '#663399',
        theme_color: '#663399',
        display: 'minimal-ui',
        icon: 'src/images/gatsby-icon.png', // This path is relative to the root of the site.
      },
    },
    'gatsby-plugin-offline',
    {
      resolve: `gatsby-plugin-emotion`,
      options: {
        // Accepts all options defined by `babel-plugin-emotion` plugin.
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `src`,
        path: `${__dirname}/src/content`,
      },
    },
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: [`gatsby-remark-autolink-headers`],
      },
    },
    `gatsby-plugin-typography`,
  ],
}
