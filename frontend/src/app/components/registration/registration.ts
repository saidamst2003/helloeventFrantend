import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, of, timeout } from 'rxjs';

interface User {
  username: string;
  password: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: { id: number, name: string }[]; 
}

interface RegistrationResponse {
  id?: number;
  username: string;
  email: string;
  roles: string[];
  message?: string;
}

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './registration.html',
  styleUrls: ['./registration.css'],
})
export class RegistrationComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  registrationForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  private readonly API_URL = 'http://localhost:8080/api/auth';

  constructor() {
    this.registrationForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['CLIENT', Validators.required]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registrationForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  hasPasswordMismatch(): boolean {
    const password = this.registrationForm.get('password')?.value;
    const confirmPassword = this.registrationForm.get('confirmPassword')?.value;
    return !!(confirmPassword && password !== confirmPassword && this.registrationForm.get('confirmPassword')?.touched);
  }

  onSubmit(): void {
    if (this.registrationForm.valid && !this.hasPasswordMismatch()) {
      this.registerUser();
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registrationForm.controls).forEach(key => {
      const control = this.registrationForm.get(key);
      control?.markAsTouched();
    });
  }

  private registerUser(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.registrationForm.value;
    const selectedRole = formValue.role;

    const user: User = {
      username: formValue.username,
      password: formValue.password,
      email: formValue.email,
      firstName: formValue.firstName || undefined,
      lastName: formValue.lastName || undefined,
      roles: [{ id: selectedRole === 'ADMIN' ? 1 : 2, name: selectedRole }]
    };

    console.log('Sending registration data:', JSON.stringify(user, null, 2));

    // Skip the test endpoint and go directly to registration
    this.http.post<RegistrationResponse>(`${this.API_URL}/register`, user, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    .pipe(
      timeout(10000), // 10 second timeout
      catchError(this.handleError.bind(this))
    )
    .subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Registration successful:', response);
        this.successMessage = response.message || 'Inscription réussie ! Redirection vers la page de connexion...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.handleRegistrationError(error);
      }
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('HTTP Error:', error);
    return of(error);
  }

  private handleRegistrationError(error: any): void {
    console.error('Registration error:', error);
    console.error('Error status:', error.status);
    console.error('Error message:', error.message);
    console.error('Error body:', error.error);
    
    switch (error.status) {
      case 0:
        this.errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur le port 8080.';
        break;
      case 400:
        this.errorMessage = error.error?.message || 'Données invalides. Vérifiez les informations saisies.';
        break;
      case 403:
        this.errorMessage = 'Accès refusé. La configuration CORS du backend doit être mise à jour.';
        break;
      case 409:
        this.errorMessage = 'Nom d\'utilisateur ou email déjà utilisé.';
        break;
      case 500:
        this.errorMessage = 'Erreur interne du serveur. Contactez l\'administrateur.';
        break;
      default:
        this.errorMessage = `Erreur ${error.status}: ${error.error?.message || 'Une erreur est survenue lors de l\'inscription.'}`;
    }
  }
}