import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
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

  userRoles = Object.values(UserRole);

  onSubmit(form: NgForm) {
    if (form.valid) {
      console.log('Formulaire soumis:', this.user);
      // Ici vous pourrez ajouter la logique pour envoyer les données au backend
    }
  }
}
