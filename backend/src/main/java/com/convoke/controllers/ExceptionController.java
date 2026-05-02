package com.convoke.controllers;

import com.convoke.services.ExceptionService;
import jakarta.annotation.Resource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
public class ExceptionController {
    private static final Logger logger = LoggerFactory.getLogger(ExceptionController.class);

    @Resource
    private ExceptionService exceptionService;

    @RequestMapping(value="/api/blow-up", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<?> throwException() {

        int i=5;

        // Throw an exception
        int result = i / 0;

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(null);
    }
}
