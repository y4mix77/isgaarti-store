package com.isga.boutique.security;

import com.isga.boutique.models.Role;
import com.isga.boutique.repositories.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        // Check if the table is empty before inserting, so we don't create duplicates
        if (roleRepository.count() == 0) {
            
            Role admin = new Role();
            admin.setName("ROLE_ADMIN");
            roleRepository.save(admin);

            Role vendeur = new Role();
            vendeur.setName("ROLE_VENDEUR");
            roleRepository.save(vendeur);

            Role client = new Role();
            client.setName("ROLE_CLIENT");
            roleRepository.save(client);

            System.out.println("✅ SECURITY SUCCESS: Default roles automatically injected into PostgreSQL!");
        }
    }
}