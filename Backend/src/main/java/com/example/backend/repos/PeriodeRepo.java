package com.example.backend.repos;

import com.example.backend.entities.PeriodeBudgetaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PeriodeRepo extends JpaRepository<PeriodeBudgetaire,Long> {
     List<PeriodeBudgetaire> findByUtilisateurId(Long utilisateurId);


    Optional<PeriodeBudgetaire> findByUtilisateurIdAndStatut(Long utilisateurId, String statut);

}
