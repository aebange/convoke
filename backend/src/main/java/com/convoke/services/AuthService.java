package com.convoke.services;

import com.convoke.models.LoginRequestDTO;
import com.convoke.models.LoginResponseDTO;
import com.convoke.security.GroupPrincipal;
import com.convoke.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(AuthenticationManager authenticationManager, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public LoginResponseDTO login(LoginRequestDTO loginRequestDTO) {
        validateLoginRequest(loginRequestDTO);

        String groupName = loginRequestDTO.getGroupName().trim();
        String password = loginRequestDTO.getPassword();

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(groupName, password)
            );
        } catch (AuthenticationException exception) {
            // Generic 401 to avoid revealing whether the group name exists
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid group name or password");
        }

        GroupPrincipal principal = (GroupPrincipal) authentication.getPrincipal();
        String token = jwtService.issue(principal.getId(), principal.getName());

        LoginResponseDTO response = new LoginResponseDTO();
        response.setToken(token);
        response.setGroupId(principal.getId());
        response.setGroupName(principal.getName());
        return response;
    }

    private void validateLoginRequest(LoginRequestDTO dto) {
        if (dto == null || dto.getGroupName() == null || dto.getGroupName().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Group name is required");
        }
        if (dto.getPassword() == null || dto.getPassword().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }
    }
}
