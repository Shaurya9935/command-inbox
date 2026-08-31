import 'dotenv/config'
import { corsair } from "./corsair"
import { getCorsairTenant } from './corsair-client';

const main = async () => {
    const tenant = await getCorsairTenant();
    const res = await tenant.gmail.db.threads.list({})
    console.log(res)
}

main()