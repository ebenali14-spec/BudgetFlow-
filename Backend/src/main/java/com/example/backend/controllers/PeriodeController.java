package com.example.backend.controllers;

import com.example.backend.dtos.RepartionRequestDTO;
import com.example.backend.dtos.RepartionResponseDTO;
import com.example.backend.services.IPeriodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.backend.dtos.PeriodeDTO;
import com.example.backend.entities.PeriodeBudgetaire;
import java.util.List;

@RestController
@RequestMapping("/periodes")
@CrossOrigin("*")
public class PeriodeController {
    @Autowired
    IPeriodeService periodeService;
    @PostMapping("/calculer-repartition")
    public ResponseEntity<RepartionResponseDTO> testerRepartition(@RequestBody RepartionRequestDTO requestDTO) {
        RepartionResponseDTO reponse = periodeService.calculerRepartition(requestDTO);
        return ResponseEntity.ok(reponse);
    }
    @PostMapping("/create")
public ResponseEntity<PeriodeBudgetaire> createPeriode(@RequestBody PeriodeDTO dto) {
    return ResponseEntity.ok(periodeService.createPeriode(dto));
}

@DeleteMapping("/delete/{id}")
public ResponseEntity<Boolean> deletePeriode(@PathVariable Long id) {
    return ResponseEntity.ok(periodeService.deletePeriode(id));
}

@PutMapping("/update")
public ResponseEntity<PeriodeBudgetaire> updatePeriode(@RequestBody PeriodeDTO dto) {
    return ResponseEntity.ok(periodeService.modifyPeriode(dto));
}

@GetMapping("/user/{idUser}")
public ResponseEntity<List<PeriodeBudgetaire>> getPeriodesByUser(@PathVariable Long idUser) {
    return ResponseEntity.ok(periodeService.getPeriodesByUser(idUser));
}

@GetMapping("/{id}")
public ResponseEntity<PeriodeBudgetaire> getPeriodeById(@PathVariable Long id) {
    return ResponseEntity.ok(periodeService.getPeriodeById(id));
}





















}
