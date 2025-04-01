package com.soundvaultpro.api.repository;

import com.soundvaultpro.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findBySupabaseId(String supabaseId);
    Boolean existsByEmail(String email);
    Boolean existsBySupabaseId(String supabaseId);
}
