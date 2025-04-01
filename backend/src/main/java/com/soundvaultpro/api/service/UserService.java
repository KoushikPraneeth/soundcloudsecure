package com.soundvaultpro.api.service;

import com.soundvaultpro.api.dto.SupabaseAuthDto;
import com.soundvaultpro.api.dto.UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final SupabaseService supabaseService;
    
    public UserDto registerOrUpdateUser(SupabaseAuthDto authDto) {
        return supabaseService.saveUserProfile(
            authDto.getSupabaseId(),
            authDto.getEmail(),
            authDto.getName(),
            authDto.getProfilePicture(),
            null,  // publicKey - not set during registration
            null   // encryptedPrivateKey - not set during registration
        );
    }
    
    public UserDto findBySupabaseId(String supabaseId) {
        return supabaseService.getUserProfile(supabaseId);
    }
    
    public UserDto saveKeyPair(String supabaseId, String publicKey, String encryptedPrivateKey) {
        return supabaseService.saveUserKeys(supabaseId, publicKey, encryptedPrivateKey);
    }
}
