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
    statut:        'ACTIVE',     // défaut ACTIVE pour les périodes réelles
    estSimulation: false
  };

  erreur    = '';
  loading   = false;
  submitted = false;

  constructor(
    private periodeService: PeriodeService,
    private router: Router
  ) {}

  // ── Durée live ────────────────────────────────────────────────
  get dureeCalculee(): number {
    if (!this.form.dateDebut || !this.form.dateFin) return 0;
    const diff = new Date(this.form.dateFin).getTime() - new Date(this.form.dateDebut).getTime();
    return diff > 0 ? Math.round(diff / (1000 * 60 * 60 * 24)) : 0;
  }

  // ── Quand on coche/décoche simulation ─────────────────────────
  onSimulationChange(): void {
    if (this.form.estSimulation) {
      // Simulation → on efface le statut (sera null côté backend)
      this.form.statut = '';
    } else {
      // Retour en mode réel → on remet le défaut ACTIVE
      this.form.statut = 'ACTIVE';
    }
    this.erreur = '';
  }

  // ── Validation front ──────────────────────────────────────────
  private valider(): boolean {
    if (!this.form.dateDebut || !this.form.dateFin) {
      this.erreur = 'Les dates de début et de fin sont obligatoires.';
      return false;
    }
    if (this.form.dateFin <= this.form.dateDebut) {
      this.erreur = 'La date de fin doit être postérieure à la date de début.';
      return false;
    }
    if (!this.form.budgetTotal || this.form.budgetTotal <= 0) {
      this.erreur = 'Le budget doit être un montant positif.';
      return false;
    }
    // EN_PAUSE bloqué côté front aussi (bouton radio disabled mais sécurité double)
    if (!this.form.estSimulation && this.form.statut === 'EN_PAUSE') {
      this.erreur = "Le statut 'En pause' n'est pas autorisé à la création.";
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

    const payload = {
      dateDebut:     this.form.dateDebut,
      dateFin:       this.form.dateFin,
      budgetTotal:   this.form.budgetTotal,
      // Si simulation → on envoie null, sinon on envoie le statut choisi
      statut:        this.form.estSimulation ? null : this.form.statut,
      estSimulation: this.form.estSimulation,
      utilisateurId: this.userId
    };

    this.periodeService.createPeriode(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/periodes'], { queryParams: { created: '1' } });
      },
      error: (err) => {
        this.loading = false;
        // Le backend renvoie 422 avec { erreur: "..." } pour les violations métier
        if (err.status === 400 && err.error?.erreur) {
          this.erreur = err.error.erreur;
        } else {
          this.erreur = 'Erreur lors de la création. Réessayez.';
        }
      }
    });
  }
}