import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Depense, PeriodeBudgetaire } from '../models/periode.model';

@Injectable({ providedIn: 'root' })
export class PeriodeService {
  private apiUrl     = 'http://localhost:3000/periodes';
  private depUrl     = 'http://localhost:3000/depenses';
  private readonly http = inject(HttpClient);
updateDepense(depense: Depense): Observable<Depense> {
  return this.http.put<Depense>(`${this.depUrl}/${depense.id}`, depense);
}
  getPeriodesByUser(userId: number): Observable<PeriodeBudgetaire[]> {
    return this.http.get<PeriodeBudgetaire[]>(`${this.apiUrl}?utilisateurId=${userId}`);
  }

  getPeriodeById(id: number | string): Observable<PeriodeBudgetaire> {
    return this.http.get<PeriodeBudgetaire>(`${this.apiUrl}/${id}`);
  }

  createPeriode(periode: any): Observable<PeriodeBudgetaire> {
    return this.http.post<PeriodeBudgetaire>(this.apiUrl, periode);
  }

  updatePeriode(periode: any): Observable<PeriodeBudgetaire> {
    return this.http.put<PeriodeBudgetaire>(`${this.apiUrl}/${periode.id}`, periode);
  }

  deletePeriode(id: number | string): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(map(() => true));
  }

  // Vérifie si l'user a déjà une période ACTIF
  hasActivePeriode(userId: number): Observable<boolean> {
    return this.http.get<PeriodeBudgetaire[]>(`${this.apiUrl}?utilisateurId=${userId}&statut=ACTIF`)
      .pipe(map(list => list.length > 0));
  }

  // Dépenses
  getDepensesByPeriode(periodeId: number | string): Observable<Depense[]> {
    return this.http.get<Depense[]>(`${this.depUrl}?periodeId=${periodeId}`);
  }

  addDepense(depense: Depense): Observable<Depense> {
    return this.http.post<Depense>(this.depUrl, depense);
  }

  deleteDepense(id: number | string): Observable<boolean> {
    return this.http.delete(`${this.depUrl}/${id}`).pipe(map(() => true));
  }
}