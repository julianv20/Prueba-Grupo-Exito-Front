import { ValidationMessagesType } from '../interfaces/validation-messages.types';

export const ValidationMessages: ValidationMessagesType = {
  fullName: {
    required: 'El nombre y apellido son requeridos',
    minlength: 'El nombre debe tener al menos 2 caracteres',
  },
  email: {
    required: 'El correo electrónico es requerido',
    email: 'El formato del correo electrónico no es válido',
  },
  password: {
    required: 'La contraseña es requerida',
    minlength: 'La contraseña debe tener al menos 6 caracteres',
    pattern: 'La contraseña debe contener al menos una mayúscula y un número',
  },
  confirmPassword: {
    required: 'La confirmación de contraseña es requerida',
    passwordMismatch: 'Las contraseñas no coinciden',
  },
  verificationCode: {
    required: 'El código de verificación es requerido',
    pattern: 'El código debe contener solo números',
  },
};
