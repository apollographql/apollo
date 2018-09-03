import React from 'react'
import styled from 'react-emotion'
import { StaticQuery, graphql } from 'gatsby'

import { Layout, Sidebar } from '../components'
import visit from 'unist-util-visit'

/**
  allMarkdownRemark {
    edges {
      node {
        fileAbsolutePath
        headings {
          value
          depth
        }
      }
    }
  }
 */

/**
 * We have to define the queries in separate components like this
 * because the StaticQuery can't take a variable for the `query` prop
 * instead of cluttering the main render logic, I split out the query into
 * its own component
 */
const PageQuery = ({ children }) => (
  <StaticQuery
    query={graphql`
      query PageQuery {
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
    `}
    render={data => <PageRender children={children} data={data} />}
  />
)

const Container = styled('div')({
  display: 'flex',
  flexDirection: 'row',
})

const PageRender = ({ data, children }) => {
  const sidebarItems = buildSidebarStructure({
    config: data.site.siteMetadata.sidebar,
    mdNodes: data.allMarkdownRemark.edges,
  })

  return (
    <Layout>
      <Container>
        <Sidebar items={sidebarItems} />
        <h1>This is a page</h1>
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

export default PageQuery
