package com.lessons.services;

import com.lessons.models.RouletteResponseDTO;
import jakarta.annotation.Resource;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.util.List;

@Service
public class RouletteService {

    @Resource
    private DataSource dataSource;

    BeanPropertyRowMapper<RouletteResponseDTO> rowMapperRoulette = new BeanPropertyRowMapper<>(RouletteResponseDTO.class);

    public List<RouletteResponseDTO> runRoulette() {

        String sql = """
                     SELECT * FROM places
                     ORDER BY RANDOM()
                     LIMIT 5
                     """;

        JdbcTemplate jt = new JdbcTemplate(this.dataSource);

        List<RouletteResponseDTO> rouletteResponseDTOs = jt.query(sql, rowMapperRoulette);

        return rouletteResponseDTOs;
    }
}
