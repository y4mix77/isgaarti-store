package com.isga.boutique;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
@EnableJpaAuditing
public class BoutiqueApplication {

    public static void main(String[] args) {
        SpringApplication.run(BoutiqueApplication.class, args);
    }

    @org.springframework.beans.factory.annotation.Value("${cors.allowed-origin-patterns}")
    private String[] allowedOriginPatterns;

    // This tells Spring Boot to allow HTTP requests from your Angular server
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOriginPatterns(allowedOriginPatterns)
                        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .exposedHeaders("Authorization");
            }
        };
    }

    @Bean
    public org.springframework.boot.CommandLineRunner initData(
            com.isga.boutique.repositories.CategorieRepository catRepo,
            com.isga.boutique.repositories.RoleRepository roleRepo,
            com.isga.boutique.repositories.UserRepository userRepo,
            org.springframework.security.crypto.password.PasswordEncoder encoder) {
        return args -> {
            // 1. Initialisation des Rôles
            if (roleRepo.count() == 0) {
                roleRepo.save(new com.isga.boutique.models.Role(null, "ROLE_ADMIN"));
                roleRepo.save(new com.isga.boutique.models.Role(null, "ROLE_VENDEUR"));
                roleRepo.save(new com.isga.boutique.models.Role(null, "ROLE_CLIENT"));
                System.out.println("Default roles created.");
            }

            // 2. Initialisation d'un Admin par défaut
            if (userRepo.count() == 0) {
                com.isga.boutique.models.User admin = new com.isga.boutique.models.User();
                admin.setNom("System Administrator");
                admin.setEmail("admin@isga.ma");
                admin.setPassword(encoder.encode("admin123"));
                
                java.util.Set<com.isga.boutique.models.Role> roles = new java.util.HashSet<>();
                roleRepo.findByName("ROLE_ADMIN").ifPresent(roles::add);
                admin.setRoles(roles);
                
                userRepo.save(admin);
                System.out.println("Default admin user created: admin@isga.ma / admin123");
            }

            // 3. Initialisation des Catégories
            if (catRepo.count() == 0) {
                com.isga.boutique.models.Categorie c = new com.isga.boutique.models.Categorie();
                c.setNom("Fournitures Scolaires");
                c.setDescription("Flagship Academic Arsenal");
                catRepo.save(c);
            }
        };
    }
}
