 export interface PeriodeBudgetaire {
  id?: number;
  dateDebut: string;
  dateFin: string;
  budgetTotal: number;
  statut: string;
    utilisateurId?: number;
}
