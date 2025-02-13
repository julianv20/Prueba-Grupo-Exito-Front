import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../auth/services/auth-service';
import { CardsService } from '../services/cards-service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-card-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './card-create.component.html',
})
export class CardCreateComponent {
  cardForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cardsService: CardsService,
    private router: Router
  ) {
    this.cardForm = this.fb.group({
      cardNumber: [''],
      initialAmount: ['', [Validators.required]],
    });

    // Suscribirse a los cambios del campo initialAmount
    this.cardForm.get('initialAmount')?.valueChanges.subscribe((value) => {
      if (value) {
        // Evitamos que se ejecute el formato si el valor está vacío
        const formattedValue = this.formatMoney(value);
        this.cardForm
          .get('initialAmount')
          ?.setValue(formattedValue, { emitEvent: false });
      }
    });
  }

  private formatMoney(value: string | number): string {
    // Removemos cualquier carácter que no sea número
    const onlyNums = value.toString().replace(/[^\d]/g, '');

    // Convertimos a número (removemos la división por 100)
    const numberValue = Number(onlyNums);

    // Formateamos usando el API de Intl
    return new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numberValue);
  }
  public onSubmit() {
    if (this.cardForm.invalid) {
      this.cardForm.markAllAsTouched();
      return;
    }

    // Formatear el monto para mostrarlo en la confirmación
    const rawAmount = this.cardForm
      .get('initialAmount')
      ?.value.replace(/[^\d]/g, '');
    const numberAmount = Number(rawAmount);
    const formattedAmount = new Intl.NumberFormat('es-MX').format(numberAmount);

    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas crear una tarjeta con monto inicial de $${formattedAmount}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#E2681C',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, crear tarjeta',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        const cardNumber = this.cardForm.get('cardNumber')?.value;

        const cardData: { initialAmount: number; cardNumber?: string } = {
          initialAmount: numberAmount,
        };

        if (cardNumber) {
          cardData.cardNumber = cardNumber;
        }

        this.cardsService
          .createCard(this.authService.getToken ?? '', cardData)
          .subscribe({
            next: (response) => {
              this.isLoading = false;
              if (response.ok) {
                Swal.fire({
                  title: '¡Éxito!',
                  text: 'La tarjeta ha sido creada correctamente',
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
                text: `Hubo un error al crear la tarjeta: ${error.error.msg}`,
                icon: 'error',
                confirmButtonColor: '#E2681C',
              });
              this.errorMessage = error.error.msg;
              console.error('Error creating card:', error);
            },
            complete: () => {
              this.isLoading = false;
            },
          });
      }
    });
  }
}
