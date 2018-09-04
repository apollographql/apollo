import React from 'react'
import styled from 'react-emotion'
import { PillButton } from '../'

// needed because the container with the bg needs to span the whole width of the page
const Container = styled('div')({
  width: '100%',
  paddingTop: '32px',
  paddingBottom: '32px',
  backgroundColor: '#eee',
})

// this part is centered, but not the whole width (unless < 800px)
const ContentWrapper = styled('div')({
  width: '80%',
  maxWidth: '800px',
  backgroundColor: '#eee',
  margin: '0 auto',
})

const PostHeader = ({ title, subtitle, editUrl, discussUrl }) => {
  return (
    <Container>
      <ContentWrapper>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <PillButton text="Edit on GitHub" url={'https://google.com'} />
        <PillButton text="Discuss on Slack" url={'https://google.com'} />
      </ContentWrapper>
    </Container>
  )
}

export default PostHeader
