import { Component, Input } from '@angular/core';
import { NavItem } from '../interfaces/navItems.type';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/services/auth-service';
import { User } from '../../auth/interfaces/register.types';
import Swal from 'sweetalert2';
import { CardsService } from '../../cards/services/cards-service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLinkActive, RouterLink],
  templateUrl: './navbar.component.html',
  styles: ``,
})
export class NavbarComponent {
  @Input() items: NavItem[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private cardsService: CardsService
  ) {}

  get user(): User | null {
    return this.authService.getUser;
  }

  logout() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Tu sesión se cerrará y tendrás que iniciar sesión nuevamente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        this.authService.logout();
        this.cardsService.clearCache();
        this.router.navigate(['/auth/login']);
        Swal.fire(
          'Sesión cerrada',
          'Has cerrado sesión exitosamente.',
          'success'
        );
      }
    });
  }
}
