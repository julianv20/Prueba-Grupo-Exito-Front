import { Component, OnInit, OnDestroy } from '@angular/core';
import { CardsService } from '../services/cards-service';
import { CommonModule } from '@angular/common';
import { Card } from '../interface/cards.types';
import { AuthService } from '../../auth/services/auth-service';
import { Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cards-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cards-list.component.html',
  styles: ``,
})
export class CardsListComponent implements OnInit, OnDestroy {
  cards: Card[] = [];
  isLoading: boolean = false;
  error: string | null = null;
  private subscription?: Subscription;

  constructor(
    private cardsService: CardsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Nos suscribimos al observable de cards$
    this.subscription = this.cardsService.cards$.subscribe((cards) => {
      this.cards = cards;
    });

    // Solo cargamos si no hay datos
    if (this.cards.length === 0) {
      this.loadCards();
    }
  }

  loadCards(): void {
    this.isLoading = true;
    this.error = null;

    this.cardsService.getCards(this.authService.getToken ?? '').subscribe({
      next: (response) => {
        if (response) {
          this.isLoading = false;
        } else {
          this.error = 'Error al cargar las tarjetas';
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.error = 'Error al cargar las tarjetas';
        this.isLoading = false;
        console.error('Error loading cards:', err);
      },
    });
  }

  // Método para forzar recarga si es necesario
  refreshCards(): void {
    this.cardsService.refreshCards(this.authService.getToken ?? '').subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
