package com.isga.boutique.controllers;

import com.isga.boutique.models.Role;
import com.isga.boutique.models.User;
import com.isga.boutique.payload.LoginRequest;
import com.isga.boutique.payload.SignupRequest;
import com.isga.boutique.repositories.RoleRepository;
import com.isga.boutique.repositories.UserRepository;
import com.isga.boutique.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    // 1. REGISTRATION ENDPOINT
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        // Create new user's account with a securely hashed password
        User user = new User();
        user.setNom(signUpRequest.getNom());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));

        Set<String> strRoles = signUpRequest.getRoles();
        Set<Role> roles = new HashSet<>();

        // Map the string roles from Angular to the actual Role entities in the database
        if (strRoles == null || strRoles.isEmpty()) {
            Role userRole = roleRepository.findByName("ROLE_CLIENT")
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                String normalizedRole = normalizeSignupRole(role);
                switch (normalizedRole) {
                    case "VENDEUR":
                        Role modRole = roleRepository.findByName("ROLE_VENDEUR")
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(modRole);
                        break;
                    default:
                        Role userRole = roleRepository.findByName("ROLE_CLIENT")
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(userRole);
                }
            });
        }

        user.setRoles(roles);
        boolean isVendorSignup = roles.stream().anyMatch(role -> "ROLE_VENDEUR".equals(role.getName()));
        user.setEnabled(!isVendorSignup);

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }

    private String normalizeSignupRole(String role) {
        if (role == null) return "CLIENT";
        String normalized = role.trim().toUpperCase(Locale.ROOT).replace("ROLE_", "");
        if ("VENDEUR".equals(normalized) || "VENDOR".equals(normalized) || "SELLER".equals(normalized)) {
            return "VENDEUR";
        }
        return "CLIENT";
    }

    // 2. LOGIN ENDPOINT
    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
        } catch (DisabledException ex) {
            return ResponseEntity.status(403).body("Votre compte vendeur est en attente d'approbation administrateur.");
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        // Generate the VIP Pass (JWT Token)
        String jwt = jwtUtils.generateJwtToken(authentication);

        // Send the token back to Angular
        return ResponseEntity.ok(jwt);
    }
}
