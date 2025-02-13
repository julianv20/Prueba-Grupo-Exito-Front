import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { NavItem } from '../interfaces/navItems.type';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  NavigationEnd,
} from '@angular/router';
import { AuthService } from '../../auth/services/auth-service';
import { CommonModule } from '@angular/common';
import { filter, Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { CardsService } from '../../cards/services/cards-service';

@Component({
  selector: 'app-navbar-mobile',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar-mobile.component.html',
  animations: [
    // Animación para el menú lateral
    trigger('slideMenu', [
      state(
        'closed',
        style({
          transform: 'translateX(-100%)',
        })
      ),
      state(
        'open',
        style({
          transform: 'translateX(0%)',
        })
      ),
      transition('closed => open', animate('300ms ease-out')),
      transition('open => closed', animate('200ms ease-in')),
    ]),
    // Animación para el overlay
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('200ms ease-in', style({ opacity: 0 }))]),
    ]),
  ],
})
export class NavbarMobileComponent implements OnInit, OnDestroy {
  @Input() items: NavItem[] = [];
  menuOpen = false;
  private routerSubscription?: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private cardsService: CardsService
  ) {}

  ngOnInit() {
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeMenu();
      });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  get user() {
    return this.authService.getUser;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    if (this.menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  closeMenu() {
    this.menuOpen = false;
    document.body.style.overflow = 'auto';
  }

  logout() {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: 'Se cerrará tu sesión actual.',
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
        this.closeMenu();
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
