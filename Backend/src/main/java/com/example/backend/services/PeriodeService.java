package com.example.backend.services;

import com.example.backend.dtos.PeriodeDTO;
import com.example.backend.dtos.RepartionResponseDTO;
import com.example.backend.dtos.RepartionRequestDTO;
import com.example.backend.entities.PeriodeBudgetaire;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.backend.entities.Utilisateur;
import com.example.backend.repos.PeriodeRepo;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
@Service
public class PeriodeService implements IPeriodeService {
    @Autowired
    PeriodeRepo periodeRepo;
    private static final Map<String, Integer> SCORES=new HashMap<>();
    static {
        // categories default
        SCORES.put("LOGEMENT_ETUDIANT_PROPRIETAIRE", 35);
        SCORES.put("LOGEMENT_ETUDIANT_LOCATAIRE", 30);
        SCORES.put("LOGEMENT_ETUDIANT_COLOCATION", 20);

        SCORES.put("LOGEMENT_PARENT_PROPRIETAIRE", 45);
        SCORES.put("LOGEMENT_PARENT_LOCATAIRE", 35);
        SCORES.put("LOGEMENT_PARENT_COLOCATION", 10);

        SCORES.put("LOGEMENT_SEUL_PROPRIETAIRE", 38);
        SCORES.put("LOGEMENT_SEUL_LOCATAIRE", 30);
        SCORES.put("LOGEMENT_SEUL_COLOCATION", 18);


        SCORES.put("TRANSPORT_ETUDIANT_VOITURE", 25);
        SCORES.put("TRANSPORT_ETUDIANT_TRANSPORT_COMMUN", 15);
        SCORES.put("TRANSPORT_ETUDIANT_VELO", 5);

        SCORES.put("TRANSPORT_PARENT_VOITURE", 35);
        SCORES.put("TRANSPORT_PARENT_TRANSPORT_COMMUN", 20);
        SCORES.put("TRANSPORT_PARENT_VELO", 8);

        SCORES.put("TRANSPORT_SEUL_VOITURE", 28);
        SCORES.put("TRANSPORT_SEUL_TRANSPORT_COMMUN", 15);
        SCORES.put("TRANSPORT_SEUL_VELO", 6);


        SCORES.put("ALIMENTATION_ETUDIANT_CUISINE", 15);
        SCORES.put("ALIMENTATION_ETUDIANT_MIXTE", 22);
        SCORES.put("ALIMENTATION_ETUDIANT_RESTAURANT", 35);

        SCORES.put("ALIMENTATION_PARENT_CUISINE", 20);
        SCORES.put("ALIMENTATION_PARENT_MIXTE", 28);
        SCORES.put("ALIMENTATION_PARENT_RESTAURANT", 40);

        SCORES.put("ALIMENTATION_SEUL_CUISINE", 15);
        SCORES.put("ALIMENTATION_SEUL_MIXTE", 22);
        SCORES.put("ALIMENTATION_SEUL_RESTAURANT", 35);


        SCORES.put("LOISIRS_ETUDIANT_PEU", 5);
        SCORES.put("LOISIRS_ETUDIANT_MODERE", 15);
        SCORES.put("LOISIRS_ETUDIANT_BEAUCOUP", 28);

        SCORES.put("LOISIRS_PARENT_PEU", 8);
        SCORES.put("LOISIRS_PARENT_MODERE", 18);
        SCORES.put("LOISIRS_PARENT_BEAUCOUP", 30);

        SCORES.put("LOISIRS_SEUL_PEU", 10);
        SCORES.put("LOISIRS_SEUL_MODERE", 20);
        SCORES.put("LOISIRS_SEUL_BEAUCOUP", 32);


        SCORES.put("SANTE_ETUDIANT_BONNE", 3);
        SCORES.put("SANTE_ETUDIANT_COURANTE", 10);
        SCORES.put("SANTE_ETUDIANT_ELEVEE", 20);

        SCORES.put("SANTE_PARENT_BONNE", 5);
        SCORES.put("SANTE_PARENT_COURANTE", 15);
        SCORES.put("SANTE_PARENT_ELEVEE", 30);

        SCORES.put("SANTE_SEUL_BONNE", 5);
        SCORES.put("SANTE_SEUL_COURANTE", 12);
        SCORES.put("SANTE_SEUL_ELEVEE", 22);

        // categories persoo
        // fréquence
        SCORES.put("CUSTOM_RAREMENT", 5);
        SCORES.put("CUSTOM_PARFOIS", 15);
        SCORES.put("CUSTOM_SOUVENT", 28);

// essentialité
        SCORES.put("CUSTOM_OPTIONNELLE", 5);
        SCORES.put("CUSTOM_UTILE", 15);
        SCORES.put("CUSTOM_ESSENTIELLE", 30);

// montant
        SCORES.put("CUSTOM_FAIBLE", 5);
        SCORES.put("CUSTOM_MOYEN", 15);
        SCORES.put("CUSTOM_ELEVE", 28);
    }

    @Override
    public PeriodeBudgetaire createPeriode(PeriodeDTO dto) {

        PeriodeBudgetaire p = new PeriodeBudgetaire();
        p.setDateDebut(dto.getDateDebut());
        p.setDateFin(dto.getDateFin());
        p.setBudgetTotal(dto.getBudgetTotal());

        Utilisateur u = new Utilisateur();
        u.setId(dto.getUtilisateurId());
        p.setUtilisateur(u);

        if ("ACTIF".equals(dto.getStatut())) {
            boolean dejaActive = periodeRepo
                    .findByUtilisateurIdAndStatut(dto.getUtilisateurId(), "ACTIF")
                    .isPresent();
            if (dejaActive) {
                throw new RuntimeException(
                        "Vous avez déjà une période active. Désactivez-la avant d'en créer une nouvelle.");
            }
        }

        p.setStatut(dto.getStatut());
        return periodeRepo.save(p);
    }
   @Override
public Boolean deletePeriode(Long idPeriode) {
    periodeRepo.deleteById(idPeriode);
    return true;
}

    @Override
    public PeriodeBudgetaire modifyPeriode(PeriodeDTO dto) {
        PeriodeBudgetaire p = periodeRepo.findById(dto.getId())
                .orElseThrow(() -> new RuntimeException("Période introuvable"));

        String statutActuel = p.getStatut();
        String nouveauStatut = dto.getStatut();

        // ACTIF → uniquement DESACTIVE ou TERMINE
        if ("ACTIF".equals(statutActuel)) {
            if (!("ACTIF".equals(nouveauStatut) ||
                    "DESACTIVE".equals(nouveauStatut) ||
                    "TERMINE".equals(nouveauStatut))) {
                throw new RuntimeException(
                        "Une période active ne peut être que maintenue active, désactivée ou terminée.");
            }
        }
        // SIMULATION → uniquement ACTIF
        if ("SIMULATION".equals(statutActuel) && "ACTIF".equals(nouveauStatut)) {
            if (dto.getDateFin() == null) {
                throw new RuntimeException(
                        "Veuillez définir une date de fin pour activer cette simulation.");
            }
            // vérifier qu'aucune période active n'existe déjà
            boolean dejaActive = periodeRepo
                    .findByUtilisateurIdAndStatut(p.getUtilisateur().getId(), "ACTIF")
                    .isPresent();
            if (dejaActive) {
                throw new RuntimeException(
                        "Vous avez déjà une période active. Désactivez-la avant d'en activer une nouvelle.");
            }
        }

        // SIMULATION ne peut pas devenir autre chose qu'ACTIF
        if ("SIMULATION".equals(statutActuel) &&
                !("ACTIF".equals(nouveauStatut) || "SIMULATION".equals(nouveauStatut))) {
            throw new RuntimeException(
                    "Une simulation ne peut être convertie qu'en période active.");
        }

        p.setDateDebut(dto.getDateDebut());
        p.setDateFin(dto.getDateFin());
        p.setBudgetTotal(dto.getBudgetTotal());
        p.setStatut(nouveauStatut);
        return periodeRepo.save(p);
    }

    @Override
    public RepartionResponseDTO calculerRepartition(RepartionRequestDTO dto) {
        Map<String, Integer> scoresCategories = new HashMap<>();


        for (String reponse : dto.getReponses()) {
            // catégorie par défaut    => "LOGEMENT_ETUDIANT_LOCATAIRE"
            // catégorie personnalisée => "Animaux_CUSTOM_SOUVENT_CUSTOM_ESSENTIELLE_CUSTOM_MOYEN"

            if (reponse.contains("CUSTOM")) {
                String[] parts = reponse.split("_CUSTOM_");
                String nomCategorie = parts[0];
                int score = 0;
                for (int i = 1; i < parts.length; i++) {
                    Integer s = SCORES.get("CUSTOM_" + parts[i]);
                    if (s != null) score += s;
                }
                scoresCategories.put(nomCategorie, score);
            } else {
                Integer score = SCORES.get(reponse);
                if (score != null) {
                    String categorie = reponse.split("_")[0];
                    scoresCategories.put(categorie, score);
                }
            }
        }

        int totalScores = scoresCategories.values().stream().mapToInt(Integer::intValue).sum();
        Map<String, Double> pourcentages = new HashMap<>();
        Map<String, Double> montants = new HashMap<>();

        for (Map.Entry<String, Integer> entry : scoresCategories.entrySet()) {
            double pct = Math.round(entry.getValue() * 1000.0 / totalScores) / 10.0;
            double montant = Math.round(pct * dto.getBudgetTotal()) / 100.0;
            pourcentages.put(entry.getKey(), pct);
            montants.put(entry.getKey(), montant);
        }

        return new RepartionResponseDTO(pourcentages, montants);
    }
    @Override
public List<PeriodeBudgetaire> getAllPlansByUser(Long idUser) {
    return periodeRepo.findByUtilisateurId(idUser);
}
@Override
public List<PeriodeBudgetaire> getPeriodesByUser(Long idUser) {
    return periodeRepo.findByUtilisateurId(idUser);
}

@Override
public PeriodeBudgetaire getPeriodeById(Long id) {
    return periodeRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Période introuvable"));
}
}

