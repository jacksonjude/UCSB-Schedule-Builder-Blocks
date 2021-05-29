function addStyleProperties(styleProperties, stylesToAdd)
{
  for (var key in stylesToAdd)
  {
    if (!(key in styleProperties))
    {
      styleProperties[key] = stylesToAdd[key]
    }
  }
}

function getNumberIterator(count)
{
  return [...Array(count).keys()]
}

export { getNumberIterator, addStyleProperties }
