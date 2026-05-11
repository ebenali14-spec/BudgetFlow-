import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategorieService {
    private apiUrl = 'http://localhost:8090/categories';
  private readonly http = inject(HttpClient);

  getAll(): Observable<{ id: string; nom: string; estParDefaut: boolean }[]> {
    return this.http.get<{ id: string; nom: string; estParDefaut: boolean }[]>(this.apiUrl);
  }
  
}
