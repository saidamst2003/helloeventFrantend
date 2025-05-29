import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginRequest } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginData: LoginRequest = {
    username: '',
    password: ''
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Méthode appelée à la soumission du formulaire
  onSubmit(form: NgForm): void {
    if (form.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      this.authService.login(this.loginData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Connexion réussie !';

          setTimeout(() => {
            this.router.navigate(['/dashboard']); // Changez la route selon vos besoins
          }, 1000);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Erreur de connexion:', error);

          if (error.status === 401) {
            this.errorMessage = 'Nom d\'utilisateur ou mot de passe incorrect';
          } else if (error.status === 400) {
            this.errorMessage = error.error || 'Données de connexion invalides';
          } else if (error.status === 0) {
            this.errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
          } else {
            this.errorMessage = 'Une erreur s\'est produite lors de la connexion';
          }
        }
      });
    }
  }

  // Redirection vers la page d'inscription
  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
