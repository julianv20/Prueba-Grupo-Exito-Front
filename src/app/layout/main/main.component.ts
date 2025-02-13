import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { NavItem } from '../interfaces/navItems.type';
import { NavbarMobileComponent } from '../navbar-mobile/navbar-mobile.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, NavbarMobileComponent],
  templateUrl: './main.component.html',
})
export class MainComponent {
  public navbarItems: NavItem[] = [
    {
      title: 'Tarjetas',
      link: '/cards',
    },
    {
      title: 'Nueva Tarjeta',
      link: '/cards/create',
    },
    {
      title: 'Nuevo Lote de Tarjetas',
      link: '/cards/batch-create',
    },
  ];
}
