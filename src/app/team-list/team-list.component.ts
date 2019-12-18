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
        this.games.push(game)
      })
      this.games.forEach((game: Game) => {
        this.getResults(game.homeResult.teamId);
        this.getResults(game.awayResult.teamId);
      })
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
      } else {
        game = this.games.find(x => x.awayResult.teamId === teamId);
        if (game) {
          game.awayResult.results = response;
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

}
