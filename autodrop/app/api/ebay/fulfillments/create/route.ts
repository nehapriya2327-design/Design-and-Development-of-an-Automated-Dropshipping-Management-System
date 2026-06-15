
import { ebayFulfillments } from '@/lib/server/ebay';
import { success } from '@/lib/server/response';

export async function GET() {

    const fulfillments = await ebayFulfillments();

    return success(fulfillments, 'Ebay fulfiments Synced.')
}