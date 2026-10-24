import test from 'node:test';
import assert from 'node:assert/strict';
import { store } from '../server/db/store.ts';
import { getProviderLeaderboard, PROVIDER_TRUST_METHOD } from '../server/services/providerTrustService.ts';

test('Provider leaderboard: ranks active providers with a transparent volume-independent score', () => {
  store.reset();
  const leaderboard = getProviderLeaderboard();

  assert.ok(leaderboard.length > 0, 'Active providers should be listed');
  assert.equal(leaderboard[0].rank, 1);
  assert.equal(
    PROVIDER_TRUST_METHOD.reliability + PROVIDER_TRUST_METHOD.ngo_rating + PROVIDER_TRUST_METHOD.safety + PROVIDER_TRUST_METHOD.handover + PROVIDER_TRUST_METHOD.verification,
    100,
    'Trust-score weights should total 100%'
  );

  for (let index = 1; index < leaderboard.length; index += 1) {
    assert.ok(leaderboard[index - 1].trust_score >= leaderboard[index].trust_score, 'Leaderboard must descend by trust score');
    assert.equal(leaderboard[index].rank, index + 1);
  }

  const provider = leaderboard.find(entry => entry.provider_id === 'R02');
  assert.ok(provider);
  assert.equal(provider.meals_redistributed, 0, 'Uncompleted surplus must not be presented as verified impact');
  assert.ok(provider.trust_score >= 0 && provider.trust_score <= 100);
});
