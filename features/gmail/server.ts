import { getCorsairTenant } from '../../lib/corsair-client'

export async function getInboxThreads() {
    const corsair = await getCorsairTenant();

    return corsair.gmail.db.threads.list({})
}