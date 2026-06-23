package com.datamigratepro.dto;

public record LoginResponse(String token, String username, long expiresIn, String role, String brandId) {}

