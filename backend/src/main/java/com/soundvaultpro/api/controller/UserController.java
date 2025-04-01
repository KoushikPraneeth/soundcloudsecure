package com.soundvaultpro.api.controller;

import com.soundvaultpro.api.dto.ResponseDto;
import com.soundvaultpro.api.dto.UserDto;
import com.soundvaultpro.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    
    @GetMapping("/{supabaseId}")
    public ResponseEntity<ResponseDto<UserDto>> getUserBySupabaseId(@PathVariable String supabaseId) {
        try {
            UserDto userDto = userService.findBySupabaseId(supabaseId);
            if (userDto == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(ResponseDto.success(userDto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDto.error("Failed to get user: " + e.getMessage()));
        }
    }
    
    @PostMapping("/{supabaseId}/keys")
    public ResponseEntity<ResponseDto<UserDto>> saveKeys(
            @PathVariable String supabaseId,
            @RequestBody Map<String, String> keyData) {
        try {
            String publicKey = keyData.get("publicKey");
            String encryptedPrivateKey = keyData.get("encryptedPrivateKey");
            
            if (publicKey == null || encryptedPrivateKey == null) {
                return ResponseEntity.badRequest().body(ResponseDto.error("Public key and encrypted private key are required"));
            }
            
            UserDto userDto = userService.saveKeyPair(supabaseId, publicKey, encryptedPrivateKey);
            return ResponseEntity.ok(ResponseDto.success("Keys saved successfully", userDto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDto.error("Failed to save keys: " + e.getMessage()));
        }
    }
}
