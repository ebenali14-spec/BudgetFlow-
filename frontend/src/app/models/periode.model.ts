export interface LigneBudget {
  categorieId: string;
  nom: string;
  pourcentage: number;
  montantAlloue: number;
  montantDepense?: number;   // calculé depuis les dépenses
}

export interface Depense {
  id?: number | string;
  description: string;
  montant: number;
  date: string;
  estImprevue: boolean;
  periodeId: number | string;
  categorieId: string;
}

export interface PeriodeBudgetaire {
  id?: number | string;
  dateDebut: string;
  dateFin: string;
  budgetTotal: number;
  statut: string;
  utilisateurId?: number;
  lignes?: LigneBudget[];
}