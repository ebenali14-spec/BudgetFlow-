import { Routes } from '@angular/router';
import { PeriodesComponent } from './components/periodes/periodes.component';

export const routes: Routes = [
  { path: '', component: PeriodesComponent },
  { path: 'periodes', component: PeriodesComponent }
];