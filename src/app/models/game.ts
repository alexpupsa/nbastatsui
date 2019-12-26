import { TeamResults } from './team-results';
import { ComputedTeamResults } from './computed-team-results';
import { ComputedTeamTotals } from './computed-team-totals';

export class Game {
    homeResult: TeamResults;
    awayResult: TeamResults;
    computedHomeResult: ComputedTeamResults;
    computedAwayResult: ComputedTeamResults;
    computedTotals: ComputedTeamTotals;
}
