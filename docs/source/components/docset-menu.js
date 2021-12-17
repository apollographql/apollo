import React, { useContext } from 'react';
import styled from '@emotion/styled';
import { DocsetIcon } from 'apollo-algolia-autocomplete';
import { MenuItem, MenuWrapper } from './menu';
import { NavItemDescription, NavItemsContext } from 'gatsby-theme-apollo-docs';
import { colors } from 'gatsby-theme-apollo-core';
import './styles.css'
const StyledLink = styled.a({
  color: 'inherit',
  textDecoration: 'none',
  ':hover': {
    textDecoration: 'underline'
  }
});

const DocsetDescription = styled.p({
  fontSize: '14px',
  marginBottom: '5px'
});

const ArticleList = styled.ul({
  marginBottom: 0,
});

const ArticleListItem = styled.li({
  fontSize: '14px',
  marginBottom: 0,
});

const ArticleListLink = styled.a({
  color: colors.primary,
  textDecoration: 'none',
  ':hover': {
    textDecoration: 'underline'
  },
  ':visited': {
    color: '#3f20ba'
  }
});

const getIconName = function(docsetName) {
  if (docsetName === 'apollo-server') {
    return 'server';
  } else if (docsetName === 'kotlin') {
    return 'android';
  } else {
    return docsetName;
  }
}

export default function DocsetMenu() {
  const navItems = useContext(NavItemsContext);
  return (
    <MenuWrapper className="menu-wrapper">
      {navItems
        .filter(navItem => !navItem.omitLandingPage)
        .map((navItem) => (
          <MenuItem
            key={navItem.url}
            icon={<DocsetIcon docset={getIconName(navItem.docset)} />}
            title={<StyledLink href={navItem.url}>{navItem.title}</StyledLink>}
            style={{"marginBottom": "20px"}}
          >
            <DocsetDescription>{navItem.description}</DocsetDescription>
            <ArticleList>
              {navItem.topArticles?.map((article) => (
                <ArticleListItem>
                  <ArticleListLink href={article.url}>{article.title}</ArticleListLink>
                </ArticleListItem>
              ))}
            </ArticleList>
          </MenuItem>
        ))}
    </MenuWrapper>
  );
}
