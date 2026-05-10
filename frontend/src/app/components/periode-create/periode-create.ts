import { Component } from '@angular/core';
import { PeriodeService } from '../../services/periode.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-periode-create',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './periode-create.html',
  styleUrl: './periode-create.css',
})
export class PeriodeCreate {

  userId = 1;
 
  form = {
    dateDebut:     '',
    dateFin:       '',
    budgetTotal:   null as number | null,
    statut:        'ACTIVE',
    estSimulation: false
  };
 
  erreur    = '';
  loading   = false;
  submitted = false;
 
  constructor(
    private periodeService: PeriodeService,
    private router: Router
  ) {}
 
  // ── Durée calculée en live ────────────────────────────────────
  get dureeCalculee(): number {
    if (!this.form.dateDebut || !this.form.dateFin) return 0;
    const diff = new Date(this.form.dateFin).getTime() - new Date(this.form.dateDebut).getTime();
    return diff > 0 ? Math.round(diff / (1000 * 60 * 60 * 24)) : 0;
  }
 
  // ── Validation ────────────────────────────────────────────────
  private valider(): boolean {
    if (!this.form.dateDebut || !this.form.dateFin || !this.form.budgetTotal) {
      this.erreur = 'Tous les champs sont obligatoires.';
      return false;
    }
    if (this.form.dateFin <= this.form.dateDebut) {
      this.erreur = 'La date de fin doit être après la date de début.';
      return false;
    }
    if (this.form.budgetTotal <= 0) {
      this.erreur = 'Le budget doit être positif.';
      return false;
    }
    return true;
  }
 
  // ── Création ──────────────────────────────────────────────────
  creerPeriode(): void {
    this.submitted = true;
    this.erreur    = '';
 
    if (!this.valider()) return;
 
    this.loading = true;
    const payload = { ...this.form, utilisateurId: this.userId };
 
    this.periodeService.createPeriode(payload).subscribe({
      next: () => {
        this.loading = false;
        // Redirect to list with success flag
        this.router.navigate(['/periodes'], { queryParams: { created: '1' } });
      },
      error: () => {
        this.loading = false;
        this.erreur  = 'Erreur lors de la création. Réessayez.';
      }
    });
  }
}
