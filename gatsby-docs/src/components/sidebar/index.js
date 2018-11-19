import React from 'react'
import styled from 'react-emotion'

const Container = styled('div')({
  width: '260px',
  backgroundColor: '#f7f8fa',
})

const Heading = styled('a')(props => ({
  marginLeft: '15px',
  display: 'block',
  backgroundColor: props.active ? '#ff0' : 'transparent',
  fontSize: '14px',
}))

const PageLink = styled('a')({
  fontSize: '14px',
})

const SectionTitle = styled('span')({
  color: '#999',
  fontWeight: 700,
  letterSpacing: '.25em',
  textTransform: 'uppercase',
  fontSize: '14px',
})

const SubSection = ({ items, activePageSlug, activeHeadingAnchor }) =>
  items &&
  items.map(item => (
    <Heading
      key={`${item.title}#${item.anchor}`}
      active={item.anchor === activeHeadingAnchor}
      href={`#${item.anchor}`}
    >
      {item.text}
    </Heading>
  ))

const Section = ({ title, items, activePageSlug, activeHeadingAnchor }) => (
  <div
    style={{
      borderBottom: '1px solid #eee',
      marginTop: '16px',
      padding: '0 0 8px 0',
    }}
  >
    <SectionTitle>{title}</SectionTitle>
    {items.map(item => (
      <div key={item.href}>
        <PageLink href={`${item.href}`}>{item.title}</PageLink>
        {/* note: need trailing slash in check, because the page slug has one */}
        {activePageSlug === `${item.href}/` && (
          <SubSection
            items={item.headings}
            activeHeadingAnchor={activeHeadingAnchor}
            activePageSlug={activePageSlug}
          />
        )}
      </div>
    ))}
  </div>
)

const Sidebar = ({ items, activePageSlug, activeHeadingAnchor, title }) => {
  return (
    <Container>
      <h3>{title.toUpperCase()}</h3>

      {items.map(section => (
        <Section
          key={section.title}
          title={section.title}
          items={section.items}
          activePageSlug={activePageSlug}
          activeHeadingAnchor={activeHeadingAnchor}
        />
      ))}
    </Container>
  )
}

export default Sidebar
