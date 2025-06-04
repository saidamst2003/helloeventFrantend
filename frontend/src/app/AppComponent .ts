import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { LoginComponent } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';

@Component({
    standalone: true,
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  imports: [RouterModule, LoginComponent, Dashboard]
  
})
export class AppComponent {
  protected title = 'frontend';
}

