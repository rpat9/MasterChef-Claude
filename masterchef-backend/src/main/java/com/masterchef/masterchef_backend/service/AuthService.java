package com.masterchef.masterchef_backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.masterchef.masterchef_backend.dto.AuthResponse;
import com.masterchef.masterchef_backend.dto.LoginRequest;
import com.masterchef.masterchef_backend.dto.RegisterRequest;
import com.masterchef.masterchef_backend.dto.TokenRefreshRequest;
import com.masterchef.masterchef_backend.dto.TokenRefreshResponse;
import com.masterchef.masterchef_backend.models.User;
import com.masterchef.masterchef_backend.repository.UserRepository;
import com.masterchef.masterchef_backend.security.JwtTokenProvider;
import com.masterchef.masterchef_backend.security.UserDetailsServiceImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;

    /**
     * Register a new user
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration failed: Email already exists: {}", request.getEmail());
            throw new RuntimeException("Email already registered");
        }

        // Create a new user
        User user = User.builder()
                        .name(request.getName())
                        .email(request.getEmail())
                        .passwordHash(passwordEncoder.encode(request.getPassword()))
                        .build();
        
        user = userRepository.save(user);
        log.info("User registered successfully: id: {}, email: {}", user.getId(), user.getEmail());

        // Generate tokens
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                                    .username(user.getEmail())
                                    .password(user.getPasswordHash())
                                    .authorities(new ArrayList<>())
                                    .build();
            
        String accessToken = jwtTokenProvider.generateAccessToken(userDetails, user.getId());
        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails, user.getId());

        // Build our response back

        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getAccessTokenExpirationSeconds())
                .issuedAt(LocalDateTime.now())
                .build();
    }

    /**
     * Authenticate user and generate tokens 
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        // Authenticate user Spring security
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        // Load user details
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        // Get user from database
        User user = userRepository.findByEmail(request.getEmail())
                        .orElseThrow(() -> new RuntimeException("User not found"));
            
        log.info("Login successfull for user: id={}, email={}", user.getId(), user.getEmail());

        // Generate tokens
        String accessToken = jwtTokenProvider.generateAccessToken(userDetails, user.getId());
        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails, user.getId());

        // Build response
        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getAccessTokenExpirationSeconds())
                .issuedAt(LocalDateTime.now())
                .build();
        
    }

    /**
     * Refresh access token using refresh token
     */
    @Transactional(readOnly = true)
    public TokenRefreshResponse refreshToken(TokenRefreshRequest request) {
        log.info("Token refresh attempt");

        String refreshToken = request.getRefreshToken();

        // Validate refresh token
        if (!jwtTokenProvider.validateRefreshToken(refreshToken)){
            log.warn("Invalid refresh token");
            throw new RuntimeException("Invalid refresh token");
        }

        // Extract username from token
        String email = jwtTokenProvider.extractUsername(refreshToken);

        // Load user details
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);

        // Get user from database
        User user = userRepository.findByEmail(email).orElseThrow(
            () -> new RuntimeException("User not found")
        );

        // Generate new access token
        String newAccessToken = jwtTokenProvider.generateRefreshToken(userDetails, user.getId());

        log.info("Token refresh successfully for user: {}", email);

        // Build response
        return TokenRefreshResponse.builder()
                .accessToken(newAccessToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getAccessTokenExpirationSeconds())
                .issuedAt(LocalDateTime.now())
                .build();
    }
}
