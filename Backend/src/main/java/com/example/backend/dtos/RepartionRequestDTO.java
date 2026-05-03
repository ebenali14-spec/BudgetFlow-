package com.example.backend.dtos;

import java.util.List;

public class RepartionRequestDTO {
    private List<String> reponses;
    private Double budgetTotal;

    public List<String> getReponses() {
        return reponses;
    }

    public void setReponses(List<String> reponses) {
        this.reponses = reponses;
    }

    public Double getBudgetTotal() {
        return budgetTotal;
    }

    public void setBudgetTotal(Double budgetTotal) {
        this.budgetTotal = budgetTotal;
    }
}
