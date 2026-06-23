package com.datamigratepro.controller;

import com.datamigratepro.entity.Activation;
import com.datamigratepro.entity.License;
import com.datamigratepro.repository.ActivationRepository;
import com.datamigratepro.repository.LicenseRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class LicenseActivationControllerTest {

    @Mock
    private LicenseRepository licenseRepository;

    @Mock
    private ActivationRepository activationRepository;

    @Mock
    private HttpServletRequest httpServletRequest;

    @InjectMocks
    private LicenseActivationController controller;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testInvalidChecksumFormat() {
        LicenseActivationController.ActivationRequest req = new LicenseActivationController.ActivationRequest();
        req.setLicenseKey("INVALID-KEY");
        req.setMachineId("mach-1");

        ResponseEntity<LicenseActivationController.ActivationResponse> response = controller.activateLicense(req, httpServletRequest);
        assertNotNull(response);
        assertFalse(response.getBody().isActivated());
        assertEquals("Invalid license key checksum validation failed", response.getBody().getMessage());
    }

    @Test
    public void testValidChecksumButNotFound() {
        // PST-ELITE-AAAE-AAAM-AAAD is valid checksum key
        LicenseActivationController.ActivationRequest req = new LicenseActivationController.ActivationRequest();
        req.setLicenseKey("PST-ELITE-AAAE-AAAM-AAAD");
        req.setMachineId("mach-1");

        when(licenseRepository.findByLicenseKey(any())).thenReturn(Optional.empty());

        ResponseEntity<LicenseActivationController.ActivationResponse> response = controller.activateLicense(req, httpServletRequest);
        assertNotNull(response);
        assertFalse(response.getBody().isActivated());
        assertEquals("License key not found", response.getBody().getMessage());
    }

    @Test
    public void testSuccessfulActivation() {
        LicenseActivationController.ActivationRequest req = new LicenseActivationController.ActivationRequest();
        req.setLicenseKey("PST-ELITE-AAAE-AAAM-AAAD");
        req.setMachineId("mach-1");
        req.setMachineName("Aman-Mac");
        req.setOsName("macOS");

        License mockLicense = new License();
        mockLicense.setLicenseKey("PST-ELITE-AAAE-AAAM-AAAD");
        mockLicense.setStatus("ACTIVE");
        mockLicense.setLicenseType("STANDARD");
        mockLicense.setMaxActivations(3);
        mockLicense.setActivations(new ArrayList<>());

        when(licenseRepository.findByLicenseKey("PST-ELITE-AAAE-AAAM-AAAD")).thenReturn(Optional.of(mockLicense));
        when(activationRepository.findByLicenseAndMachineId(any(), any())).thenReturn(Optional.empty());

        ResponseEntity<LicenseActivationController.ActivationResponse> response = controller.activateLicense(req, httpServletRequest);
        assertNotNull(response);
        assertTrue(response.getBody().isActivated());
        assertEquals("Activation successful", response.getBody().getMessage());
        assertEquals(2, response.getBody().getActivationsRemaining());
        assertEquals("STANDARD", response.getBody().getLicenseType());
    }

    @Test
    public void testMaxActivationsLimit() {
        LicenseActivationController.ActivationRequest req = new LicenseActivationController.ActivationRequest();
        req.setLicenseKey("PST-ELITE-AAAE-AAAM-AAAD");
        req.setMachineId("mach-4");

        License mockLicense = new License();
        mockLicense.setLicenseKey("PST-ELITE-AAAE-AAAM-AAAD");
        mockLicense.setStatus("ACTIVE");
        mockLicense.setLicenseType("STANDARD");
        mockLicense.setMaxActivations(0);
        
        ArrayList<Activation> activations = new ArrayList<>();
        activations.add(new Activation(1, mockLicense, "mach-1", "m1", "os", "ip", OffsetDateTime.now(), OffsetDateTime.now()));
        activations.add(new Activation(2, mockLicense, "mach-2", "m2", "os", "ip", OffsetDateTime.now(), OffsetDateTime.now()));
        activations.add(new Activation(3, mockLicense, "mach-3", "m3", "os", "ip", OffsetDateTime.now(), OffsetDateTime.now()));
        mockLicense.setActivations(activations);

        when(licenseRepository.findByLicenseKey("PST-ELITE-AAAE-AAAM-AAAD")).thenReturn(Optional.of(mockLicense));
        when(activationRepository.findByLicenseAndMachineId(any(), any())).thenReturn(Optional.empty());

        ResponseEntity<LicenseActivationController.ActivationResponse> response = controller.activateLicense(req, httpServletRequest);
        assertNotNull(response);
        assertFalse(response.getBody().isActivated());
        assertEquals("Maximum activations limit reached (0)", response.getBody().getMessage());
    }
}
