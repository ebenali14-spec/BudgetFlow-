package com.example.backend.dtos;

import java.time.LocalDate;

public class PeriodeDTO {
    private Long id;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private double budgetTotal;
    private String statut;
    private boolean estSimulation;
    private Long utilisateurId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getDateDebut() { return dateDebut; }
    public void setDateDebut(LocalDate dateDebut) { this.dateDebut = dateDebut; }

    public LocalDate getDateFin() { return dateFin; }
    public void setDateFin(LocalDate dateFin) { this.dateFin = dateFin; }

    public double getBudgetTotal() { return budgetTotal; }
    public void setBudgetTotal(double budgetTotal) { this.budgetTotal = budgetTotal; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public boolean isEstSimulation() { return estSimulation; }
    public void setEstSimulation(boolean estSimulation) { this.estSimulation = estSimulation; }

    public Long getUtilisateurId() { return utilisateurId; }
    public void setUtilisateurId(Long utilisateurId) { this.utilisateurId = utilisateurId; }
}
