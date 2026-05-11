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
    dateDebut:   '',
    dateFin:     '',
    budgetTotal: null as number | null,
    statut:      'ACTIF',
    estSimulation: false
  };

  erreur    = '';
  loading   = false;
  submitted = false;

  // date min = aujourd'hui
  get todayStr(): string {
    return new Date().toISOString().split('T')[0];
  }

  get dureeCalculee(): number {
    if (!this.form.dateDebut || !this.form.dateFin) return 0;
    const diff = new Date(this.form.dateFin).getTime() - new Date(this.form.dateDebut).getTime();
    return diff > 0 ? Math.round(diff / (1000 * 60 * 60 * 24)) : 0;
  }

  constructor(private periodeService: PeriodeService, private router: Router) {}

  private valider(): boolean {
    if (!this.form.dateDebut || !this.form.dateFin) {
      this.erreur = 'Les dates de début et de fin sont obligatoires.';
      return false;
    }
    if (this.form.dateDebut < this.todayStr) {
      this.erreur = 'La date de début ne peut pas être dans le passé.';
      return false;
    }
    if (this.form.dateFin <= this.form.dateDebut) {
      this.erreur = 'La date de fin doit être postérieure à la date de début.';
      return false;
    }
    if (this.dureeCalculee < 7) {
      this.erreur = 'La période doit durer au minimum 7 jours.';
      return false;
    }
    if (!this.form.budgetTotal || this.form.budgetTotal <= 0) {
      this.erreur = 'Le budget doit être un montant positif.';
      return false;
    }
    return true;
  }

  creerPeriode(): void {
    this.submitted = true;
    this.erreur    = '';

    if (!this.valider()) return;

    this.loading = true;

    const payload = {
      dateDebut:     this.form.dateDebut,
      dateFin:       this.form.dateFin,
      budgetTotal:   this.form.budgetTotal,
      statut:        this.form.estSimulation ? 'SIMULATION' : 'ACTIF',
      utilisateurId: this.userId
    };

    this.periodeService.createPeriode(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/periodes'], { queryParams: { created: '1' } });
      },
      error: (err) => {
        this.loading = false;
        if (err.error?.message) {
          this.erreur = err.error.message;
        } else {
          this.erreur = 'Erreur lors de la création. Réessayez.';
        }
      }
    });
  }
}