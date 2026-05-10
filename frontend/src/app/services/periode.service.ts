import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PeriodeBudgetaire } from '../models/periode.model';

@Injectable({
  providedIn: 'root'
})
export class PeriodeService {
  private apiUrl = 'http://localhost:8090/periodes';

 private readonly http:HttpClient=inject(HttpClient)

  getPeriodesByUser(userId: number): Observable<PeriodeBudgetaire[]> {
    return this.http.get<PeriodeBudgetaire[]>(`${this.apiUrl}/user/${userId}`);
  }

  getPeriodeById(id: number): Observable<PeriodeBudgetaire> {
    return this.http.get<PeriodeBudgetaire>(`${this.apiUrl}/${id}`);
  }

  createPeriode(periode: any): Observable<PeriodeBudgetaire> {
    return this.http.post<PeriodeBudgetaire>(`${this.apiUrl}`, periode);
  }

  updatePeriode(periode: any): Observable<PeriodeBudgetaire> {
    return this.http.put<PeriodeBudgetaire>(`${this.apiUrl}`, periode);
  }

  deletePeriode(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/delete/${id}`);
  }
  
}
