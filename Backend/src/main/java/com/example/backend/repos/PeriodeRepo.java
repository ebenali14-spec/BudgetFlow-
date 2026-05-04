package com.example.backend.repos;

import com.example.backend.entities.PeriodeBudgetaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PeriodeRepo extends JpaRepository<PeriodeBudgetaire,Long> {
     List<PeriodeBudgetaire> findByUtilisateurId(Long utilisateurId);

    List<PeriodeBudgetaire> findByUtilisateurIdAndEstSimulation(Long utilisateurId, boolean estSimulation);
    


}
