import { GameResult } from './game-result';

export class TeamResults {
    teamId: string;
    results: GameResult[];
    avg5Games: number;
    avg10Games: number;
    avgHomeAwayGames: number;
    avgAllGames: number;
    powerRatings: number;
    powerRating5Games: number;
    powerRating10Games: number;
}
