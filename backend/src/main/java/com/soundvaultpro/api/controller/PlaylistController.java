package com.soundvaultpro.api.controller;

import com.soundvaultpro.api.dto.PlaylistDto;
import com.soundvaultpro.api.dto.ResponseDto;
import com.soundvaultpro.api.service.PlaylistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/playlists")
@RequiredArgsConstructor
public class PlaylistController {
    
    private final PlaylistService playlistService;
    
    @GetMapping
    public ResponseEntity<ResponseDto<List<PlaylistDto>>> getPlaylists(@RequestParam String supabaseId) {
        try {
            List<PlaylistDto> playlists = playlistService.getPlaylistsByUser(supabaseId);
            return ResponseEntity.ok(ResponseDto.success(playlists));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDto.error("Failed to get playlists: " + e.getMessage()));
        }
    }
    
    @PostMapping
    public ResponseEntity<ResponseDto<PlaylistDto>> createPlaylist(
            @RequestParam String supabaseId,
            @RequestBody Map<String, String> playlistData) {
        try {
            String name = playlistData.get("name");
            String description = playlistData.get("description");
            
            if (name == null) {
                return ResponseEntity.badRequest().body(ResponseDto.error("Playlist name is required"));
            }
            
            PlaylistDto playlist = playlistService.createPlaylist(supabaseId, name, description);
            return ResponseEntity.ok(ResponseDto.success("Playlist created successfully", playlist));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDto.error("Failed to create playlist: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{playlistId}")
    public ResponseEntity<ResponseDto<PlaylistDto>> updatePlaylist(
            @PathVariable Long playlistId,
            @RequestParam String supabaseId,
            @RequestBody Map<String, String> playlistData) {
        try {
            String name = playlistData.get("name");
            String description = playlistData.get("description");
            
            if (name == null) {
                return ResponseEntity.badRequest().body(ResponseDto.error("Playlist name is required"));
            }
            
            PlaylistDto playlist = playlistService.updatePlaylist(supabaseId, playlistId, name, description);
            return ResponseEntity.ok(ResponseDto.success("Playlist updated successfully", playlist));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDto.error("Failed to update playlist: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{playlistId}")
    public ResponseEntity<ResponseDto<Void>> deletePlaylist(
            @PathVariable Long playlistId,
            @RequestParam String supabaseId) {
        try {
            playlistService.deletePlaylist(supabaseId, playlistId);
            return ResponseEntity.ok(ResponseDto.success("Playlist deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDto.error("Failed to delete playlist: " + e.getMessage()));
        }
    }
}
