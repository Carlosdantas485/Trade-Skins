import { Routes } from '@angular/router';

import { AdminSettings } from './pages/admin-settings/admin-settings';
import { HomeComponent } from './pages/home/home';
import { Login } from './pages/login/login';
import { Marketplace } from './pages/marketplace/marketplace';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: Login },
    { path: 'admin', component: AdminSettings },
    { path: 'admin/settings', component: AdminSettings },
    { path: 'marketplace', component: Marketplace },
];
