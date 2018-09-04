import React from 'react'
import styled from 'react-emotion'

import NavButton from './nav-button'
import { PillButton } from '../'

const Container = styled('div')(props => ({
  width: '100%',
  paddingTop: '32px',
  paddingBottom: '32px',
  flexDirection: 'column',
  textAlign: 'center',
}))

const ContentWrapper = styled('div')({
  width: '80%',
  maxWidth: '800px',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'space-between',
})

const Spacer = styled('div')({
  border: '0px',
  height: 1,
  borderBottom: '1px solid #eee',
  marginTop: '32px',
  marginBottom: '32px',
})

const PostFooter = ({ editUrl, nextTitle, nextUrl, prevTitle, prevUrl }) => {
  return (
    <Container>
      <Spacer />
      <ContentWrapper bordered>
        {prevTitle ? (
          <NavButton type="previous" title={prevTitle} url={prevUrl} />
        ) : null}
        {nextTitle ? (
          <NavButton type="next" title={nextTitle} url={nextUrl} />
        ) : null}
      </ContentWrapper>
      <Spacer />
      <PillButton url={editUrl} text="Edit On GitHub" />
    </Container>
  )
}

export default PostFooter
