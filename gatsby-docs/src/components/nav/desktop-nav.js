import React, { Component } from 'react'
import styled from 'react-emotion'

import { colors } from './utils'

const DesktopNav = styled('div')({
  display: 'flex',
  flex: 1,
  textAlign: 'right',
  position: 'absolute',
  right: 0,
  top: '0.6rem',
  padding: '0',
})

// the container for the root nav links
const SubMenu = styled('div')({
  display: 'inline-block',
  textAlign: 'left',
  position: 'relative',
  marginLeft: '40px',
  ':first-of-type': { marginLeft: '0' },
})

// the visible links on the root of the nav
const RootNavLink = styled('a')({
  textDecoration: 'none',
  color: colors.lightest,
  transition: 'all 250ms ease-out',
  fontWeight: 600,
  ':hover': { textDecoration: 'underline' },
  padding: '10px 0 10px 0',
})

// container that appears on hover over RootNavLink
const Popup = styled('div')(({ hasSections }) => ({
  opacity: 1,
  pointerEvents: 'none',
  position: 'absolute',
  top: '50px',
  backgroundColor: '#0F2A4A',
  padding: '22px 30px 22px 24px',
  right: '50%',
  transform: 'translateX(50%)',
  borderRadius: '3px',
  boxShadow: 'fade(@color-darkest, 20%) 0 2px 16px',
  transition: 'all 250ms ease-in-out',
  textAlign: 'right',
}))

// each vertical column in a popup
const PopupSection = styled('div')({
  marginRight: '36px',
  ':last-of-type': { marginRight: 0 },
})

// headings for a PopupSection
const SubHeading = styled('div')({
  color: colors.dark,
  fontSize: '12px',
  textTransform: 'uppercase',
  marginBottom: '8px',
})

// links inside a popup section
const PopupLink = styled('a')({
  textDecoration: 'none',
  transition: 'all 250ms ease-out',
  fontWeight: 600,
  color: colors.darker,
  display: 'block',
  whiteSpace: 'nowrap',
  margin: '18px 0',
  lineHeight: '30px',
  ':first-of-type': { marginTop: 0 },
  ':last-of-type': { marginBottom: 0 },
  ':hover': { textDecoration: 'underline' },
})

export default class Nav extends Component {
  render() {
    const { navItems } = this.props
    return (
      <nav>
        <DesktopNav data-name="desktop-nav">
          {navItems.map((item, i) => {
            // check if there are subsections
            let hasSections
            if (item.children) {
              hasSections = item.children.reduce(
                (r, c) => (c.subheading ? true : r),
                false
              )

              return (
                <HoverableSubMenu
                  key={item.title}
                  item={item}
                  hasSections={hasSections}
                />
              )
            } else {
              return null
            }
          })}
        </DesktopNav>
      </nav>
    )
  }
}

class HoverableSubMenu extends Component {
  state = { showPopup: false }

  // show the popup
  onMouseEnter = () => this.setState(s => ({ showPopup: true }))

  // hide the popup
  onMouseLeave = () => this.setState(s => ({ showPopup: false }))

  render = () => {
    const { item, hasSections } = this.props
    return (
      <SubMenu
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      >
        <RootNavLink target={item.newPage ? '_blank' : ''} href={item.href}>
          <span>{item.title}</span>
        </RootNavLink>
        {this.state.showPopup && item.children && item.children.length ? (
          <Popup hasSections={hasSections}>
            {item.children.map(
              child =>
                child.subheading ? (
                  <PopupSection key={child.title}>
                    <SubHeading>{child.subheading}</SubHeading>
                    {child.children &&
                      child.children.map(subChild => (
                        <PopupLink
                          href={subChild.href}
                          target={subChild.newPage ? '_blank' : ''}
                        >
                          <span>{subChild.title}</span>
                        </PopupLink>
                      ))}
                  </PopupSection>
                ) : (
                  <PopupLink
                    key={child.title}
                    href={child.href}
                    target={child.newPage ? '_blank' : ''}
                  >
                    <span>{child.title}</span>
                  </PopupLink>
                )
            )}
          </Popup>
        ) : null}
      </SubMenu>
    )
  }
}
