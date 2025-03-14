export const timeOffset = (2024 - 1970) * 31536000 * 1000

export const setIntervalImmediately = (func, interval) => {
  func()
  return setInterval(func, interval)
}

export const modifyProductTags = (product) => {
  const modifiedProduct = { ...product }

  for (const tag of product.tags) {
    const [key, value] = tag.split(':')
    if (value) {
      modifiedProduct[key] = value
    }
  }

  delete modifiedProduct.tags

  return modifiedProduct
}