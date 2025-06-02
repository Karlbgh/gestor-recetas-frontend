import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginFormComponent } from '../../components/login-form/login-form.component';
import { RegisterFormComponent } from '../../components/register-form/register-form.component';
import { SocialAuthButtonsComponent } from '../../components/social-auth-buttons/social-auth-buttons.component';
import { FooterComponent } from '../../../../layout/footer/footer.component';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [
    CommonModule,
    LoginFormComponent,
    RegisterFormComponent,
    SocialAuthButtonsComponent,
    FooterComponent,
  ],
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.scss']
})
export class AuthPageComponent {
  showLogin = signal(true);

  toggleForm(): void {
    this.showLogin.set(!this.showLogin());
  }
}
