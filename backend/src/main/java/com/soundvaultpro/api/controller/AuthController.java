package com.soundvaultpro.api.controller;

import com.soundvaultpro.api.dto.ResponseDto;
import com.soundvaultpro.api.dto.SupabaseAuthDto;
import com.soundvaultpro.api.dto.UserDto;
import com.soundvaultpro.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final UserService userService;
    
    @PostMapping("/register")
    public ResponseEntity<ResponseDto<UserDto>> registerUser(@RequestBody SupabaseAuthDto authDto) {
        try {
            UserDto userDto = userService.registerOrUpdateUser(authDto);
            return ResponseEntity.ok(ResponseDto.success("User registered/updated successfully", userDto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDto.error("Failed to register/update user: " + e.getMessage()));
        }
    }
}
