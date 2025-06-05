import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

interface User {
  username: string;
  password: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

interface RegistrationResponse {
  id?: number;
  username: string;
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
    email: ['', [Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    role: ['', Validators.required]  
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
    const user: User = {
      username: formValue.username,
      password: formValue.password,
      email: formValue.email || undefined,
      firstName: formValue.firstName || undefined,
      lastName: formValue.lastName || undefined,
      role: formValue.role
    };

    this.http.post<RegistrationResponse>(`${this.API_URL}/register`, user)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Inscription réussie ! Redirection vers la page de connexion...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Registration error:', error);
          if (error.status === 400) {
            this.errorMessage = error.error || 'Ce nom d\'utilisateur existe déjà';
          } else if (error.status === 0) {
            this.errorMessage = 'Erreur de connexion au serveur. Vérifiez que le backend est démarré.';
          } else {
            this.errorMessage = 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.';
          }
        }
      });
  }
}
