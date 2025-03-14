import { json } from "@sveltejs/kit"
import { products } from "$server/api"

export const GET = async({ url }) => {
  const game = url.searchParams.get("game")
  const variantIds = url.searchParams.get("variantIds")?.split(",")

  return json(variantIds.map(variantId => 
    products?.[game]?.products?.find(product => product.variantId.includes(variantId))
  ))
}