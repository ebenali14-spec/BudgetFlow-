package com.example.backend.dtos;

import java.util.List;
import java.util.Map;

public class RepartionResponseDTO {
    private Map<String, Double> pourcentages;
    private Map<String, Double> montants;

    public Map<String, Double> getPourcentages() {
        return pourcentages;
    }

    public void setPourcentages(Map<String, Double> pourcentages) {
        this.pourcentages = pourcentages;
    }

    public Map<String, Double> getMontants() {
        return montants;
    }

    public void setMontants(Map<String, Double> montants) {
        this.montants = montants;
    }

    public RepartionResponseDTO(Map<String, Double> pourcentages, Map<String, Double> montants) {
        this.pourcentages = pourcentages;
        this.montants = montants;
    }
}
