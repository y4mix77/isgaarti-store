package com.isga.boutique.payload;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import java.util.Set;

@Getter @Setter
public class SignupRequest {
    @NotBlank
    private String nom;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    // Angular will send an array like ["admin"] or ["vendeur"] or ["client"]
    private Set<String> roles; 
}