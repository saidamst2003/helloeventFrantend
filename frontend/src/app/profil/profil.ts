// components/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { profile } from 'console';
import { AuthService } from '../services/auth';
import { User } from '../models/user';

interface Booking {
  id: number;
  eventTitle: string;
  eventDate: Date;
  ticketCount: number;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled';
}


@Component({
  selector: 'app-profile',
   templateUrl: './profil.html',
  styleUrls: ['./profil.css'],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  bookings: Booking[] = [];
  updating = false;
  currentUser: User | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUsername();
    if (this.currentUser) {
      this.profileForm.patchValue(this.currentUser);
    }
    this.loadBookings();
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      this.updating = true;
      
      // Simulation de la mise à jour
      setTimeout(() => {
        this.snackBar.open('Profil mis à jour avec succès!', 'Fermer', { duration: 3000 });
        this.updating = false;
      }, 1000);
    }
  }

  loadBookings(): void {
    // Simulation de données de réservation
    this.bookings = [
      {
        id: 1,
        eventTitle: 'Concert de Jazz au Sunset',
        eventDate: new Date('2025-07-15T20:00:00'),
        ticketCount: 2,
        totalPrice: 50,
        status: 'confirmed'
      },
      {
        id: 2,
        eventTitle: 'Conférence Tech Innovation',
        eventDate: new Date('2025-08-22T14:00:00'),
        ticketCount: 1,
        totalPrice: 25,
        status: 'pending'
      }
    ];
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'confirmed': return 'primary';
      case 'pending': return 'accent';
      case 'cancelled': return 'warn';
      default: return 'primary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  }

  cancelBooking(bookingId: number): void {
    // Simulation d'annulation
    this.snackBar.open('Réservation annulée avec succès', 'Fermer', { duration: 3000 });
    this.loadBookings();
  }
}
