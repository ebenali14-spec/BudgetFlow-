package com.example.backend.controllers;

import com.example.backend.dtos.RepartionRequestDTO;
import com.example.backend.dtos.RepartionResponseDTO;
import com.example.backend.services.IPeriodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
