package com.masterchef.masterchef_backend.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.masterchef.masterchef_backend.models.User;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    
    /**
     * Find the user by email (will be used for login/registration)
     * Spring Data JPA automatically implements this based on method names
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if email already exists (used during registration)
     */
    boolean existsByEmail(String email);

}