package com.convoke.controllers;

import com.convoke.config.AppConfig;
import com.convoke.config.SecurityConfig;
import com.convoke.models.groups.CreateGroupDTO;
import com.convoke.models.groups.GetGroupDTO;
import com.convoke.models.groups.GetGroupNameAvailabilityDTO;
import com.convoke.security.GroupPrincipal;
import com.convoke.security.JwtService;
import com.convoke.services.AuthService;
import com.convoke.services.ExceptionService;
import com.convoke.services.GroupDetailsService;
import com.convoke.services.GroupService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {AuthController.class, GroupController.class})
@Import({SecurityConfig.class, AuthService.class, JwtService.class, AppConfig.class})
@TestPropertySource(properties = {
        "convoke.jwt.secret=" + AuthControllerTest.SECRET,
        "convoke.jwt.expiration-days=30"
})
class AuthControllerTest {

    static final String SECRET = "3rs1PJDRvUbfiE69leG8gCWeTF1UL9BM/CRfKCIblfE=";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @MockitoBean
    private GroupDetailsService groupDetailsService;

    @MockitoBean
    private GroupService groupService;

    @MockitoBean
    private ExceptionService exceptionService;

    // ------------------------------------------------------------------ login

    @Test
    void loginReturnsTokenForValidCredentials() throws Exception {
        String hash = new BCryptPasswordEncoder().encode("secret123");
        when(groupDetailsService.loadUserByUsername("mygroup"))
                .thenReturn(new GroupPrincipal(7, "MyGroup", hash));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"groupName\":\"mygroup\",\"password\":\"secret123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.groupId").value(7))
                .andExpect(jsonPath("$.groupName").value("MyGroup"));
    }

    @Test
    void loginReturns401ForWrongPassword() throws Exception {
        String hash = new BCryptPasswordEncoder().encode("secret123");
        when(groupDetailsService.loadUserByUsername("mygroup"))
                .thenReturn(new GroupPrincipal(7, "MyGroup", hash));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"groupName\":\"mygroup\",\"password\":\"wrong-password\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid group name or password"));
    }

    @Test
    void loginReturns401ForUnknownGroup() throws Exception {
        when(groupDetailsService.loadUserByUsername("ghost"))
                .thenThrow(new UsernameNotFoundException("Group not found"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"groupName\":\"ghost\",\"password\":\"secret123\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid group name or password"));
    }

    @Test
    void loginReturns400WhenPasswordMissing() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"groupName\":\"mygroup\"}"))
                .andExpect(status().isBadRequest());
    }

    // --------------------------------------------------------------- protected

    @Test
    void protectedEndpointReturns401WithoutToken() throws Exception {
        mockMvc.perform(get("/api/groups"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedEndpointReturns401WithInvalidToken() throws Exception {
        mockMvc.perform(get("/api/groups").header("Authorization", "Bearer not-a-real-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedEndpointReturns401WithExpiredToken() throws Exception {
        mockMvc.perform(get("/api/groups").header("Authorization", "Bearer " + expiredToken()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedEndpointReturns200WithValidToken() throws Exception {
        when(groupService.getGroups()).thenReturn(List.of());

        mockMvc.perform(get("/api/groups")
                        .header("Authorization", "Bearer " + jwtService.issue(7, "MyGroup")))
                .andExpect(status().isOk());
    }

    // ---------------------------------------------------------------- public

    @Test
    void checkNameIsReachableWithoutToken() throws Exception {
        when(groupService.checkGroupName("mygroup"))
                .thenReturn(new GetGroupNameAvailabilityDTO("mygroup", true, false, "That name is already taken"));

        mockMvc.perform(get("/api/groups/check-name").param("name", "mygroup"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exists").value(true))
                .andExpect(jsonPath("$.available").value(false));
    }

    @Test
    void createGroupIsReachableWithoutToken() throws Exception {
        GetGroupDTO created = new GetGroupDTO();
        created.setId(9);
        created.setName("NewGroup");
        when(groupService.createGroup(any(CreateGroupDTO.class))).thenReturn(created);

        mockMvc.perform(post("/api/groups/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"NewGroup\",\"password\":\"secret123\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(9))
                .andExpect(jsonPath("$.name").value("NewGroup"));
    }

    private String expiredToken() {
        SecretKey key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(SECRET));
        long now = System.currentTimeMillis();

        return Jwts.builder()
                .subject("7")
                .claim("groupId", 7)
                .claim("groupName", "MyGroup")
                .issuedAt(new Date(now - 7_200_000))
                .expiration(new Date(now - 3_600_000))
                .signWith(key)
                .compact();
    }
}
