// form-error.service.ts
import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidatorFn } from '@angular/forms';
import { ValidationMessages } from './validation-messages';

@Injectable({
  providedIn: 'root',
})
export class FormErrorService {
  getErrorMessage(control: AbstractControl, fieldName: string): string {
    if (control.errors && control.touched) {
      const firstError = Object.keys(control.errors)[0];
      return ValidationMessages[fieldName]?.[firstError] || 'Campo inválido';
    }
    return '';
  }

  hasError(control: AbstractControl): boolean {
    return control.invalid && (control.dirty || control.touched);
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Nueva función para validar contraseñas
  createPasswordMatchValidator(): ValidatorFn {
    return (formGroup: AbstractControl): { [key: string]: any } | null => {
      const password = formGroup.get('password');
      const confirmPassword = formGroup.get('confirmPassword');

      if (!password || !confirmPassword) return null;

      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      } else {
        const currentErrors = confirmPassword.errors;
        if (currentErrors) {
          delete currentErrors['passwordMismatch'];
          confirmPassword.setErrors(
            Object.keys(currentErrors).length ? currentErrors : null
          );
        }
        return null;
      }
    };
  }
}
