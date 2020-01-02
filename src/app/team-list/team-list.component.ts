import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Team } from '../models/team';
import { environment } from 'src/environments/environment';
import { ScheduledGame } from '../models/scheduled-game';
import { TeamResults } from '../models/team-results';
import { GameResult } from '../models/game-result';
import { Game } from '../models/game';
import { ComputedTeamResults } from '../models/computed-team-results';
import { ComputedTeamTotals } from '../models/computed-team-totals';

@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.css']
})
export class TeamListComponent implements OnInit {

  teams: Team[];
  games: Game[];

  date: Date;

  countResults: number;

  isLoading: boolean;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.games = [];
    this.date = this.getDate();
    this.countResults = 0;
    this.isLoading = true;
    this.getTeams();
  }

  getSchedule() {
    const date = encodeURIComponent(this.date.toDateString());
    const url = `${environment.apiUrl}/stats/schedule/${date}`;
    this.http.get(url).subscribe((response: ScheduledGame[]) => {
      response.forEach((scheduledGame: ScheduledGame) => {
        const game = new Game();
        game.homeResult = new TeamResults();
        game.homeResult.teamId = scheduledGame.homeTeamId;
        game.awayResult = new TeamResults();
        game.awayResult.teamId = scheduledGame.awayTeamId;
        this.games.push(game);
      });
      this.games.forEach((game: Game) => {
        this.getResults(game.homeResult.teamId);
        this.getResults(game.awayResult.teamId);
      });
    });
  }

  getTeams() {
    const url = `${environment.apiUrl}/stats/teams`;
    this.http.get(url).subscribe((response: Team[]) => {
      this.teams = response;
      this.getSchedule();
    });
  }

  getResults(teamId: string) {
    const teamName = this.getTeamUrlName(teamId);
    const date = encodeURIComponent(this.date.toDateString());
    const url = `${environment.apiUrl}/stats/results/${teamName}/${date}`;
    this.http.get(url).subscribe((response: GameResult[]) => {
      let game = this.games.find(x => x.homeResult.teamId === teamId);
      if (game) {
        game.homeResult.results = response;
        this.computeAverages(game.homeResult, true);
      } else {
        game = this.games.find(x => x.awayResult.teamId === teamId);
        if (game) {
          game.awayResult.results = response;
          this.computeAverages(game.awayResult, false);
        }
      }
      this.countResults++;
      if (this.countResults === this.games.length * 2) {
        this.computeAll();
      }
    });
  }

  getTeamName(id: string) {
    return this.teams.find(x => x.teamId === id).fullName;
  }

  getTeamUrlName(id: string) {
    return this.teams.find(x => x.teamId === id).urlName;
  }

  computeAverages(teamResults: TeamResults, isHomeTeam: boolean) {
    teamResults.avg5Games = teamResults.results.slice(0, 5).reduce((s, x) => s + x.homeScore, 0)
      / Math.min(5, teamResults.results.length);
    teamResults.avg10Games = teamResults.results.slice(0, 10).reduce((s, x) => s + x.homeScore, 0)
      / Math.min(10, teamResults.results.length);
    teamResults.avgAllGames = teamResults.results.reduce((s, x) => s + x.homeScore, 0)
      / teamResults.results.length;
    const homeAwayGames = teamResults.results.filter(x => x.isHomeTeam === isHomeTeam);
    teamResults.avgHomeAwayGames = homeAwayGames.reduce((s, x) => s + x.homeScore, 0) / homeAwayGames.length;
    teamResults.avg5HomeAwayGames = homeAwayGames.slice(0, 5).reduce((s, x) => s + x.homeScore, 0) / Math.min(5, homeAwayGames.length);

    teamResults.avg5GamesAgainst = teamResults.results.slice(0, 5).reduce((s, x) => s + x.awayScore, 0)
      / Math.min(5, teamResults.results.length);
    teamResults.avg10GamesAgainst = teamResults.results.slice(0, 10).reduce((s, x) => s + x.awayScore, 0)
      / Math.min(10, teamResults.results.length);
    teamResults.avgAllGamesAgainst = teamResults.results.reduce((s, x) => s + x.awayScore, 0)
      / teamResults.results.length;
    teamResults.avgHomeAwayGamesAgainst = homeAwayGames.reduce((s, x) => s + x.awayScore, 0) / homeAwayGames.length;
    teamResults.avg5HomeAwayGamesAgainst = homeAwayGames.slice(0, 5).reduce((s, x) => s + x.awayScore, 0)
      / Math.min(5, homeAwayGames.length);

    teamResults.powerRatings = teamResults.results.reduce((s, x) => s + x.homeScore - x.awayScore + (x.isHomeTeam ? 3 : 0), 0)
      / teamResults.results.length;
    teamResults.powerRating5Games = teamResults.results.slice(0, 5)
      .reduce((s, x) => s + x.homeScore - x.awayScore + (x.isHomeTeam ? 3 : 0), 0) / Math.min(5, teamResults.results.length);
    teamResults.powerRating10Games = teamResults.results.slice(0, 10)
      .reduce((s, x) => s + x.homeScore - x.awayScore + (x.isHomeTeam ? 3 : 0), 0) / Math.min(10, teamResults.results.length);
    teamResults.powerRatings5HomeAwayGames = homeAwayGames.slice(0, 5)
      .reduce((s, x) => s + x.homeScore - x.awayScore + (x.isHomeTeam ? 3 : 0), 0) / Math.min(5, homeAwayGames.length);
  }

  computeAll() {
    this.games.forEach((game: Game) => {
      game.computedHomeResult = new ComputedTeamResults();
      game.computedHomeResult.avg5Games = (game.homeResult.avg5Games + game.awayResult.avg5GamesAgainst) / 2;
      game.computedHomeResult.avg10Games = (game.homeResult.avg10Games + game.awayResult.avg10GamesAgainst) / 2;
      game.computedHomeResult.avg5HomeAwayGames = (game.homeResult.avg5HomeAwayGames + game.awayResult.avg5HomeAwayGamesAgainst) / 2;
      game.computedHomeResult.avgHomeAwayGames = (game.homeResult.avgHomeAwayGames + game.awayResult.avgHomeAwayGamesAgainst) / 2;
      game.computedHomeResult.avgAllGames = (game.homeResult.avgAllGames + game.awayResult.avgAllGamesAgainst) / 2;

      game.computedAwayResult = new ComputedTeamResults();
      game.computedAwayResult.avg5Games = (game.awayResult.avg5Games + game.homeResult.avg5GamesAgainst) / 2;
      game.computedAwayResult.avg10Games = (game.awayResult.avg10Games + game.homeResult.avg10GamesAgainst) / 2;
      game.computedAwayResult.avg5HomeAwayGames = (game.awayResult.avg5HomeAwayGames + game.homeResult.avg5HomeAwayGamesAgainst) / 2;
      game.computedAwayResult.avgHomeAwayGames = (game.awayResult.avgHomeAwayGames + game.homeResult.avgHomeAwayGamesAgainst) / 2;
      game.computedAwayResult.avgAllGames = (game.awayResult.avgAllGames + game.homeResult.avgAllGamesAgainst) / 2;

      game.computedTotals = new ComputedTeamTotals();
      game.computedTotals.total5Games = game.computedHomeResult.avg5Games + game.computedAwayResult.avg5Games;
      game.computedTotals.total10Games = game.computedHomeResult.avg10Games + game.computedAwayResult.avg10Games;
      game.computedTotals.total5HomeAwayGames = game.computedHomeResult.avg5HomeAwayGames + game.computedAwayResult.avg5HomeAwayGames;
      game.computedTotals.totalHomeAwayGames = game.computedHomeResult.avgHomeAwayGames + game.computedAwayResult.avgHomeAwayGames;
      game.computedTotals.totalAllGames = game.computedHomeResult.avgAllGames + game.computedAwayResult.avgAllGames;
    });
    this.isLoading = false;
  }

  getDate() {
    const date = new Date();
    if (date.getHours() < 8) {
      date.setDate(date.getDate() - 1);
    }
    return date;
  }

  onSelectDate(event: any) {
    this.games = [];
    this.countResults = 0;
    this.isLoading = true;
    this.getTeams();
  }
}
