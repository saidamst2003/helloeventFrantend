import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User, UserRole } from '../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user: User = {
    username: '',
    email: '',
    password: '',
    role: UserRole.CLIENT
  };

  userRoles = ['USER', 'ADMIN', 'MODERATOR'];

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(form: NgForm): void {
    if (form.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      this.authService.register(this.user).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Inscription réussie ! Vous pouvez maintenant vous connecter.';
          
          this.resetForm();

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Erreur d\'inscription:', error);

          if (error.status === 400) {
            if (typeof error.error === 'string') {
              this.errorMessage = error.error;
            } else {
              this.errorMessage = 'Données d\'inscription invalides';
            }
          } else if (error.status === 0) {
            this.errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
          } else {
            this.errorMessage = 'Une erreur s\'est produite lors de l\'inscription';
          }
        }
      });
    }
  }

  private resetForm(): void {
    this.user = {
      username: '',
      email: '',
      password: '',
    role: UserRole.CLIENT
    };
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
