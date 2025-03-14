import { json } from "@sveltejs/kit"
import { currencyRates } from "$server/api"

export const GET = async({ url }) => {
  const from = url.searchParams.get("from")
  const to = url.searchParams.get("to")

  if (!currencyRates[from] || !currencyRates[to]) 
    return json({ error: true, message: "Currencies not supported." })

  return json({ rate: currencyRates[to] / currencyRates[from] })
}