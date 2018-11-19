import visit from 'unist-util-visit'

/**
 * takes in info from the gatsby-config file (`config`) and a list of nodes
 * from allMarkdownRemark and does a couple things:
 *  1.  for each item in the config.sections list, it tries to find the md node
 *      associated with the 'href' on the section
 *  2.  if an item is found, traverse its html AST and find any h2 or h3 headings
 *      and get their ids, so they can be attached to the config node for sidebar
 *      display
 */
export const buildSidebarStructure = ({ config, mdNodes }) => {
  return config.sections.map(section => {
    // for each _item_, find the corresponding md node
    // if the md node has subheadings, add to the section
    const itemsWithHeadingAnchors = section.items.map(item => {
      // either relative (guides/versioning) or absolute (https://...)
      const pathToItem = item.href

      // find the md node from the list that's associated with the config item
      const matchingMdNode = mdNodes.find(({ node }) =>
        node.fileAbsolutePath.includes(pathToItem)
      )

      // if an item has no headings, we don't need to do anything with it
      if (!matchingMdNode) return item

      // to mutate by the visit callback
      let headings = []

      visit(
        matchingMdNode.node.htmlAst,
        'element',
        pushHeadingInfoFromNode(headings)
      )

      // merge headings onto the existing item
      return { ...item, headings }
    })

    // update the items key on the current object
    return { ...section, items: itemsWithHeadingAnchors }
  })
}

// used inside the previous function as the callback for the "visi" fn
// it takes a heading array, and pushes heading data onto it
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

// given the current page's slug and the list of MD nodes, return the previous
// and next post's slug and url
export const getPreviousAndNextPost = ({ slug, nodes }) => {
  const currentIndex = nodes.findIndex(n => n.node.fields.slug === slug)
  const previous =
    currentIndex && currentIndex > 0 ? nodes[currentIndex - 1] : null
  const next =
    currentIndex && currentIndex < nodes.length - 1
      ? nodes[currentIndex + 1]
      : null

  return {
    previous: {
      title: previous ? previous.node.frontmatter.title : null,
      relativeUrl: previous ? previous.node.fields.slug : null,
    },
    next: {
      title: next ? next.node.frontmatter.title : null,
      relativeUrl: next ? next.node.fields.slug : null,
    },
  }
}
