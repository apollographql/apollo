import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { StaticQuery, graphql } from 'gatsby'
import styled from 'react-emotion'

import { DesktopNav } from '../components/nav'

import './layout.css'

/**
 * We have to define the queries in separate components like this
 * because the StaticQuery can't take a variable for the `query` prop
 * instead of cluttering the main render logic, I split out the query into
 * its own component
 */
const LayoutQuery = ({ children }) => (
  <StaticQuery
    query={graphql`
      query SiteTitleQuery {
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
          }
        }
      }
    `}
    render={data => <LayoutRender children={children} data={data} />}
  />
)

LayoutQuery.propTypes = {
  children: PropTypes.node.isRequired,
}

const Container = styled('div')({
  margin: 0,
  width: '100%',
  paddingTop: 0,
})

const NavWrapper = styled('div')({
  backgroundColor: '#1d127d',
  height: '64px',
  width: '100%',
})

const LayoutRender = ({ children, data }) => {
  const navItems = data.site.siteMetadata.navItems

  return (
    <>
      <Helmet
        title={data.site.siteMetadata.title}
        meta={[
          { name: 'description', content: 'Sample' },
          { name: 'keywords', content: 'sample, something' },
        ]}
      >
        <html lang="en" />
      </Helmet>
      <Container>
        <NavWrapper>
          <DesktopNav navItems={navItems} />
        </NavWrapper>
        {children}
      </Container>
    </>
  )
}

export default LayoutQuery
