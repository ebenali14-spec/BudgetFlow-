package com.example.backend.services;

import com.example.backend.dtos.PeriodeDTO;
import com.example.backend.dtos.RepartionResponseDTO;
import com.example.backend.dtos.RepartionRequestDTO;
import com.example.backend.entities.PeriodeBudgetaire;

import java.util.List;

public interface IPeriodeService {
    //gestion
    PeriodeBudgetaire createPeriode(PeriodeDTO p);
    Boolean deletePeriode(Long idPeriod);
    PeriodeBudgetaire modifyPeriode(PeriodeDTO p);

    //plan perso
    RepartionResponseDTO calculerRepartition(RepartionRequestDTO dto);


    //get infos
    List<PeriodeBudgetaire> getAllPlansByUser(Long idUser); // les simulations
    List<PeriodeBudgetaire> getPeriodesByUser(Long idUser); // les vrais plans
    PeriodeBudgetaire getPeriodeById(Long id);



}
