import React from 'react'
import styled, { css } from 'react-emotion'
import { graphql } from 'gatsby'

import { buildSidebarStructure, getPreviousAndNextPost } from '../utils'
import { Layout, Sidebar, PostHeader, PostFooter } from '../components'

export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
        description
      }
      fields {
        slug
      }
    }
    site {
      siteMetadata {
        title
        navItems {
          title
          href
          class
          children {
            title
            href
            newPage
            subheading
            children {
              title
              href
              newPage
            }
          }
        }
        sidebar {
          title
          sections {
            title
            items {
              title
              href
            }
          }
        }
      }
    }
    allMarkdownRemark {
      edges {
        node {
          frontmatter {
            title
          }
          fileAbsolutePath
          headings {
            value
            depth
          }
          htmlAst
          fields {
            slug
          }
        }
      }
    }
  }
`

const Container = styled('div')({
  display: 'flex',
  flexDirection: 'row',
})

const Content = styled('div')({
  padding: '32px',
})

export default ({ data, children }) => {
  const sidebarItems = buildSidebarStructure({
    config: data.site.siteMetadata.sidebar,
    mdNodes: data.allMarkdownRemark.edges,
  })
  const post = data.markdownRemark
  const { previous, next } = getPreviousAndNextPost({
    slug: data.markdownRemark.fields.slug,
    nodes: data.allMarkdownRemark.edges,
  })

  return (
    <Layout>
      <Container>
        <Sidebar
          title={data.site.siteMetadata.sidebar.title}
          items={sidebarItems}
          activePageSlug={post.fields.slug}
          activeHeadingAnchor={'what-is-apollo'}
        />

        <div className={css({ flexDirection: 'column' })}>
          {/* todo: proper edit/discussion links */}
          <PostHeader
            title={data.markdownRemark.frontmatter.title}
            subtitle={data.markdownRemark.frontmatter.description}
          />

          <Content dangerouslySetInnerHTML={{ __html: post.html }} />

          {/* TODO: proper edit url */}
          <PostFooter
            editUrl=""
            nextTitle={next.title}
            prevTitle={previous.title}
            nextUrl={next.relativeUrl}
            prevUrl={previous.relativeUrl}
          />
        </div>
      </Container>
    </Layout>
  )
}
