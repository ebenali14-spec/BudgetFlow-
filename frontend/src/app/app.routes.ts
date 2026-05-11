import { Routes } from '@angular/router';
import { PeriodesList } from './components/periodes-list/periodes-list';
import { PeriodeCreate } from './components/periode-create/periode-create';
import { PeriodeEdit } from './components/periode-edit/periode-edit';

export const routes: Routes = [
  { path: '', component: PeriodesList },
  { path: 'periodes', component: PeriodesList },
    { path: 'periodes/add', component: PeriodeCreate },
      { path: 'periodes/edit/:id', component: PeriodeEdit }



];