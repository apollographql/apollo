import React from 'react'
import styled from 'react-emotion'

const Container = styled('div')({
  width: '100%',
  paddingTop: '32px',
  paddingBottom: '32px',
  backgroundColor: '#eee',
})

const HeaderWrapper = styled('div')({
  width: '80%',
  maxWidth: '800px',
  backgroundColor: '#eee',
  margin: '0 auto',
})

const PostHeader = ({ title, subtitle, editUrl, discussUrl }) => {
  return (
    <Container>
      <HeaderWrapper>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <a href={editUrl}>Edit on GitHub</a>
        <a href={discussUrl}>Discuss on Slack</a>
      </HeaderWrapper>
    </Container>
  )
}

export default PostHeader
