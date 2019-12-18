import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Team } from '../team';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.css']
})
export class TeamListComponent implements OnInit {

  teams: Team[];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    const url = `${environment.apiUrl}/stats/teams`;
    this.http.get(url).subscribe((response: Team[]) => {
      this.teams = response;
    });
  }

}
