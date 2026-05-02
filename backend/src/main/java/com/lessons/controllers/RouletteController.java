package com.lessons.controllers;

import com.lessons.models.RouletteResponseDTO;
import com.lessons.services.RouletteService;
import jakarta.annotation.Resource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
public class RouletteController {
    private static final Logger logger = LoggerFactory.getLogger(RouletteController.class);

    @Resource
    private RouletteService rouletteService;

    @RequestMapping("/api/roulette")
    public ResponseEntity<List<RouletteResponseDTO>> getRoulette() {
        List<RouletteResponseDTO> responseDTOs = this.rouletteService.runRoulette();
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(responseDTOs);
    }
}
