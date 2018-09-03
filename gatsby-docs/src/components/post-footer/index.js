import React from 'react'
import styled from 'react-emotion'

const Container = styled('div')({
  width: '100%',
  paddingTop: '32px',
  paddingBottom: '32px',
  backgroundColor: '#eee',
  flexDirection: 'column',
})

const PostFooter = ({ editUrl, nextTitle, nextUrl, prevTitle, prevUrl }) => {
  return (
    <Container>
      <div>
        {prevTitle ? <a href={prevUrl}>{prevTitle}</a> : null}
        {nextTitle ? <a href={nextUrl}>{nextTitle}</a> : null}
      </div>
      <a href={editUrl}>Edit on GitHub</a>
    </Container>
  )
}

export default PostFooter
