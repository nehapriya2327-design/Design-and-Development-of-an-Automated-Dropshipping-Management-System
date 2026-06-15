
import { fetchEbayReturns } from '@/lib/server/ebay';
import { success } from '@/lib/server/response';

export async function GET() {

    const returns = await fetchEbayReturns();

    return success(returns, 'Ebay returns.')
}