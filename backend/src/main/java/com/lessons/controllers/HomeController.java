package com.lessons.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;


@Controller
public class HomeController {

    /**
     * This page endpoint is needed to ensure that all page routes to the Angular Frontend
     * @return a string which causes Spring Web to redirect the user to index.html
     *
     * NOTE:  If the user is going to /app1/page/view/reports, then
     *         1. Spring will redirect the user to the /index.html
     *         2. Angular routes will redirect the user to the route for view/reports
     */
    @RequestMapping(value = {"/", "/page/**"}, method = RequestMethod.GET)
    public String home() {

        // This method handles two cases:
        // Case 1: The user goes to http://localhost:8080/convoke  --> Take users to the index.html
        // Case 2: The user goes to http://localhost:8080/convoke/page/... and presses refresh --> Take users to the index.html
        return "forward:/index.html";
    }
}
