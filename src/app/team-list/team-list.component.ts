import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Team } from '../team';
import { environment } from 'src/environments/environment';
import { ScheduledGame } from '../scheduled-game';
import { TeamResults } from '../team-results';
import { GameResult } from '../game-result';
import { Game } from '../game';

@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.css']
})
export class TeamListComponent implements OnInit {

  teams: Team[];
  games: Game[];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.games = [];
    this.getTeams();
  }

  getSchedule() {
    const url = `${environment.apiUrl}/stats/schedule`;
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
    const url = `${environment.apiUrl}/stats/results/${teamName}`;
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
    teamResults.powerRatings = teamResults.results.reduce((s, x) => s + x.homeScore - x.awayScore + (x.isHomeTeam ? 3 : 0), 0)
      / teamResults.results.length;
    teamResults.powerRating5Games = teamResults.results.slice(0, 5).reduce((s, x) => s + x.homeScore - x.awayScore + (x.isHomeTeam ? 3 : 0), 0)
      / Math.min(5, teamResults.results.length);
    teamResults.powerRating10Games = teamResults.results.slice(0, 10).reduce((s, x) => s + x.homeScore - x.awayScore + (x.isHomeTeam ? 3 : 0), 0)
      / Math.min(10, teamResults.results.length);
  }
}
