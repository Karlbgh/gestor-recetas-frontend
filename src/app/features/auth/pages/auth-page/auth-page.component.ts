import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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
export class AuthPageComponent implements OnInit {
  private route = inject(ActivatedRoute);

  showLogin = signal(true);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const mode = params.get('mode');
      if (mode === 'register') {
        this.showLogin.set(false);
      } else {
        this.showLogin.set(true);
      }
    });
  }

  toggleForm(): void {
    this.showLogin.set(!this.showLogin());
  }
}
