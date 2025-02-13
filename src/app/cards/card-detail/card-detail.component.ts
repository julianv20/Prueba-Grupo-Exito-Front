import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth-service';
import { CardsService } from '../services/cards-service';
import { Card, Transaction } from '../interface/cards.types';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-card-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './card-detail.component.html',
  styles: ``,
})
export class CardDetailComponent implements OnInit {
  public card$!: Observable<Card | null>; // Declaramos el tipo
  public transactions: Transaction[] = [];
  public isLoading: boolean = true;
  public isLoadingHistory: boolean = false;
  public error: string = '';
  public historyError: string = '';
  public transactionForm: FormGroup;
  public isSubmitting = false;

  constructor(
    private authService: AuthService,
    private cardsService: CardsService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.transactionForm = this.fb.group({
      description: ['', [Validators.required]],
      amount: ['', [Validators.required]],
    });

    // Suscribirse a los cambios del campo amount
    this.transactionForm.get('amount')?.valueChanges.subscribe((value) => {
      if (value) {
        // Evitamos que se ejecute el formato si el valor está vacío
        const formattedValue = this.formatMoney(value);
        this.transactionForm
          .get('amount')
          ?.setValue(formattedValue, { emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    this.card$ = this.cardsService.currentCard$;
    const token = this.authService.getToken ?? '';

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (!id) {
        this.error = 'ID no encontrado';
        this.isLoading = false;
        return;
      }

      this.loadCard(token, id);
      this.loadHistory(token, id);
    });
  }

  private formatMoney(value: string | number): string {
    // Removemos cualquier carácter que no sea número
    const onlyNums = value.toString().replace(/[^\d]/g, '');

    // Convertimos a número
    const numberValue = Number(onlyNums);

    // Formateamos usando el API de Intl
    return new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numberValue);
  }

  onSubmit(): void {
    if (this.transactionForm.invalid || this.isSubmitting) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    const token = this.authService.getToken ?? '';
    const id = this.route.snapshot.params['id'];

    if (!token || !id) return;

    // Formatear el monto para mostrarlo en la confirmación
    const rawAmount = this.transactionForm
      .get('amount')
      ?.value.replace(/[^\d]/g, '');
    const numberAmount = Number(rawAmount);
    const formattedAmount = new Intl.NumberFormat('es-MX').format(numberAmount);

    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas realizar una transacción por $${formattedAmount}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#E2681C',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, realizar transacción',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isSubmitting = true;

        const transactionData = {
          description: this.transactionForm.get('description')?.value,
          amount: numberAmount,
          id,
        };

        this.cardsService.createTransaction(token, transactionData).subscribe({
          next: (response) => {
            this.isSubmitting = false;
            if (response.ok) {
              Swal.fire({
                title: '¡Éxito!',
                text: response.msg,
                icon: 'success',
                confirmButtonColor: '#E2681C',
              }).then(() => {
                this.transactionForm.reset();
                this.loadHistory(token, id);
                this.cardsService.refreshCards;
              });
            }
          },
          error: (error) => {
            this.isSubmitting = false;
            Swal.fire({
              title: 'Error',
              text: error.error.msg || 'Error al crear la transacción',
              icon: 'error',
              confirmButtonColor: '#E2681C',
            });
            console.error('Error creating transaction:', error);
          },
        });
      }
    });
  }

  deleteCard(id: string): void {
    const token = this.authService.getToken ?? '';

    if (!token || !id) return;

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.cardsService.deleteCard(token, id).subscribe({
          next: (response) => {
            if (response.ok) {
              Swal.fire({
                title: '¡Eliminada!',
                text: response.msg,
                icon: 'success',
                confirmButtonColor: '#E2681C',
              }).then(() => {
                // Navegar de vuelta a la lista de tarjetas
                this.router.navigate(['/cards']);
              });
            }
          },
          error: (error) => {
            Swal.fire({
              title: 'Error',
              text: error.error?.msg || 'Error al eliminar la tarjeta',
              icon: 'error',
              confirmButtonColor: '#E2681C',
            });
          },
        });
      }
    });
  }

  private loadCard(token: string, id: string): void {
    this.isLoading = true;
    this.error = '';

    this.cardsService.getCardById(token, id).subscribe({
      next: (response) => {
        if (!response.ok) {
          this.error = 'No se pudo cargar la tarjeta';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar la tarjeta';
        this.isLoading = false;
        console.error('Error loading card:', error);
      },
    });
  }

  private loadHistory(token: string, id: string): void {
    this.isLoadingHistory = true;
    this.historyError = '';

    this.cardsService.getHistory(token, id).subscribe({
      next: (response) => {
        if (response.ok) {
          this.transactions = response.transactions;
        } else {
          this.historyError = 'No se pudo cargar el historial';
        }
        this.isLoadingHistory = false;
      },
      error: (error) => {
        this.historyError = 'Error al cargar el historial';
        this.isLoadingHistory = false;
        console.error('Error loading history:', error);
      },
    });
  }
}
