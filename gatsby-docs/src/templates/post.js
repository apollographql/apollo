import React from 'react'
import styled, { css } from 'react-emotion'
import { StaticQuery, graphql } from 'gatsby'

import { Layout, Sidebar, PostHeader, PostFooter } from '../components'
import visit from 'unist-util-visit'

const Container = styled('div')({
  display: 'flex',
  flexDirection: 'row',
})

const Content = styled('div')({
  padding: '32px',
})

const PageRender = ({ data, children }) => {
  const sidebarItems = buildSidebarStructure({
    config: data.site.siteMetadata.sidebar,
    mdNodes: data.allMarkdownRemark.edges,
  })
  const post = data.markdownRemark

  return (
    <Layout>
      <Container>
        <Sidebar items={sidebarItems} />
        <div className={css({ flexDirection: 'column' })}>
          {/* TODO: proper titles/urls */}
          <PostHeader
            title="Welcome"
            subtitle={'Start here to learn how to use the Apollo platform.'}
          />

          <Content dangerouslySetInnerHTML={{ __html: post.html }} />

          {/* TODO: proper titles/urls */}
          <PostFooter
            editUrl=""
            nextTitle={'The Apollo Platform'}
            prevTitle={'The Apollo Platform'}
            nextUrl={'https://google.com'}
            prevUrl={'https://google.com'}
          />
        </div>
      </Container>
    </Layout>
  )
}

const buildSidebarStructure = ({ config, mdNodes }) => {
  return config.sections.map(section => {
    // for each _item_, find the corresponding md node
    // if the md node has subheadings, add to the section
    const itemsWithHeadingAnchors = section.items.map(item => {
      // either relative (guides/versioning) or absolute (https://...)
      const pathToItem = item.href

      const matchingMdNode = mdNodes.find(({ node }) =>
        node.fileAbsolutePath.includes(pathToItem)
      )

      if (!matchingMdNode) return item

      let headings = []
      visit(
        matchingMdNode.node.htmlAst,
        'element',
        pushHeadingInfoFromNode(headings)
      )

      return { ...item, headings }
    })

    return { ...section, items: itemsWithHeadingAnchors }
  })
}

const pushHeadingInfoFromNode = headings => node => {
  if (node.tagName === 'h1' || node.tagName === 'h2' || node.tagName === 'h3') {
    const textNode = node.children.find(c => c.type === 'text')
    headings.push({
      level: node.tagName,
      anchor: node.properties.id,
      text: textNode ? textNode.value : null,
    })
  }
}

export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
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
          sections {
            title
            items {
              title
              href
              relative
            }
          }
        }
      }
    }
    allMarkdownRemark {
      edges {
        node {
          fileAbsolutePath
          headings {
            value
            depth
          }
          htmlAst
        }
      }
    }
  }
`

export default PageRender
