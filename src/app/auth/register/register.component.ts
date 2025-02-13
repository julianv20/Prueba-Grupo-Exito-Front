import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FormErrorService } from '../services/form-error-service';
import { AuthService } from '../services/auth-service';
import { RegisterRequest } from '../interfaces/register.types';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styles: ``,
})
export class RegisterComponent {
  registerForm: FormGroup;
  public errorResponse: string = '';
  public isLoading: boolean = false;
  constructor(
    private fb: FormBuilder,
    private formErrorService: FormErrorService,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        fullName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        verificationCode: [
          '',
          [Validators.required, Validators.pattern('^[0-9]*$')],
        ],
      },
      {
        validators: this.formErrorService.createPasswordMatchValidator(),
      }
    );
  }

  getErrorMessage(control: AbstractControl, fieldName: string): string {
    return this.formErrorService.getErrorMessage(control, fieldName);
  }

  hasError(control: AbstractControl): boolean {
    return this.formErrorService.hasError(control);
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.formErrorService.markFormGroupTouched(this.registerForm);
      return;
    }
    this.isLoading = true;
    const registerData: RegisterRequest = {
      fullName: this.registerForm.get('fullName')?.value,
      email: this.registerForm.get('email')?.value,
      password: this.registerForm.get('password')?.value,
      code: this.registerForm.get('verificationCode')?.value,
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        console.log('response', response);
        localStorage.setItem('token', response.token);
        this.registerForm.reset();
        this.errorResponse = '';
        this.isLoading = false;
        this.router.navigate(['/cards']);
      },
      error: (error) => {
        console.log('error', error.error.msg);
        this.errorResponse = error.error.msg;
        this.isLoading = false;
      },
    });
  }
}
