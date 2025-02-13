import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../auth/services/auth-service';
import { CardsService } from '../services/cards-service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-card-batch-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './card-batch-create.component.html',
})
export class CardBatchCreateComponent {
  batchForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cardsService: CardsService,
    private router: Router
  ) {
    this.batchForm = this.fb.group({
      cards: this.fb.array([]),
    });

    // Agregamos la primera tarjeta por defecto
    this.addCard();
  }

  get cards() {
    return this.batchForm.get('cards') as FormArray;
  }

  addCard() {
    const cardForm = this.fb.group({
      cardNumber: [''],
      initialAmount: ['', [Validators.required]],
    });

    // Suscribirse a los cambios del campo initialAmount
    cardForm.get('initialAmount')?.valueChanges.subscribe((value) => {
      if (value) {
        const formattedValue = this.formatMoney(value);
        cardForm
          .get('initialAmount')
          ?.setValue(formattedValue, { emitEvent: false });
      }
    });

    this.cards.push(cardForm);
  }

  removeCard(index: number) {
    if (this.cards.length > 1) {
      this.cards.removeAt(index);
    }
  }

  private formatMoney(value: string | number): string {
    const onlyNums = value.toString().replace(/[^\d]/g, '');
    const numberValue = Number(onlyNums);
    return new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numberValue);
  }

  public onSubmit() {
    if (this.batchForm.invalid) {
      this.markAllAsTouched();
      return;
    }

    const cardsData = this.cards.controls.map((control) => {
      const rawAmount = control
        .get('initialAmount')
        ?.value.replace(/[^\d]/g, '');
      const numberAmount = Number(rawAmount);
      const cardNumber = control.get('cardNumber')?.value;

      const cardData: { initialAmount: number; cardNumber?: string } = {
        initialAmount: numberAmount,
      };

      if (cardNumber) {
        cardData.cardNumber = cardNumber;
      }

      return cardData;
    });

    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas crear ${cardsData.length} tarjetas?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#E2681C',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, crear tarjetas',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        console.log('cardsData', cardsData);
        this.cardsService
          .createBatchCards(this.authService.getToken ?? '', cardsData)
          .subscribe({
            next: (response) => {
              this.isLoading = false;
              if (response.ok) {
                Swal.fire({
                  title: '¡Éxito!',
                  text: 'Las tarjetas han sido creadas correctamente',
                  icon: 'success',
                  confirmButtonColor: '#E2681C',
                }).then(() => {
                  this.router.navigate(['/cards']);
                });
              }
            },
            error: (error) => {
              this.isLoading = false;
              Swal.fire({
                title: 'Error',
                text: `Hubo un error al crear las tarjetas: ${error.error.msg}`,
                icon: 'error',
                confirmButtonColor: '#E2681C',
              });
              this.errorMessage = error.error.msg;
              console.error('Error creating cards:', error);
            },
            complete: () => {
              this.isLoading = false;
            },
          });
      }
    });
  }
  private markAllAsTouched() {
    this.cards.controls.forEach((control) => {
      // Hacemos el cast a FormGroup
      const formGroup = control as FormGroup;
      Object.keys(formGroup.controls).forEach((key) => {
        formGroup.get(key)?.markAsTouched();
      });
    });
  }
}
