package com.datamigratepro.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api/admin/backups")
public class BackupController {

    private static final Logger log = LoggerFactory.getLogger(BackupController.class);
    private static final String BACKUP_DIR_PATH = "/backups";

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @Value("${spring.datasource.username}")
    private String datasourceUsername;

    @Value("${spring.datasource.password}")
    private String datasourcePassword;

    /**
     * GET /api/admin/backups
     * Lists all backup files present in the mounted /backups directory.
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listBackups() {
        File dir = new File(BACKUP_DIR_PATH);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        File[] files = dir.listFiles((d, name) -> name.startsWith("db_backup_") && name.endsWith(".sql.gz"));
        List<Map<String, Object>> backupsList = new ArrayList<>();

        if (files != null) {
            Arrays.sort(files, Comparator.comparingLong(File::lastModified).reversed());
            for (File file : files) {
                Map<String, Object> info = new HashMap<>();
                info.put("fileName", file.getName());
                info.put("sizeBytes", file.length());
                info.put("lastModified", file.lastModified());
                info.put("formattedDate", new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date(file.lastModified())));
                backupsList.add(info);
            }
        }

        return ResponseEntity.ok(backupsList);
    }

    /**
     * POST /api/admin/backups/trigger
     * Forcefully runs a pg_dump to back up the current PostgreSQL database.
     */
    @PostMapping("/trigger")
    public ResponseEntity<Map<String, String>> triggerBackup() {
        File dir = new File(BACKUP_DIR_PATH);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        Map<String, String> connectionInfo = parseJdbcUrl(datasourceUrl);
        String host = connectionInfo.get("host");
        String port = connectionInfo.get("port");
        String dbName = connectionInfo.get("database");

        String timestamp = new SimpleDateFormat("yyyy-MM-dd_HH-mm-ss").format(new Date());
        String backupFileName = "db_backup_" + timestamp + ".sql.gz";
        String backupFilePath = BACKUP_DIR_PATH + "/" + backupFileName;

        log.info("Forcefully triggering pg_dump to {}", backupFilePath);

        try {
            // Build script command to run pg_dump and pipe to gzip
            String cmd = String.format(
                "PGPASSWORD='%s' pg_dump -h %s -p %s -U %s -d %s | gzip > %s",
                datasourcePassword.replace("'", "'\\''"), // escape quotes
                host, port, datasourceUsername, dbName, backupFilePath
            );

            ProcessBuilder pb = new ProcessBuilder("bash", "-c", cmd);
            Process process = pb.start();
            int exitCode = process.waitFor();

            if (exitCode == 0 && new File(backupFilePath).exists() && new File(backupFilePath).length() > 0) {
                log.info("Successfully backup database to {}", backupFileName);
                Map<String, String> response = new HashMap<>();
                response.put("status", "success");
                response.put("fileName", backupFileName);
                response.put("message", "Database backup taken successfully.");
                return ResponseEntity.ok(response);
            } else {
                log.error("Failed to run pg_dump command. Exit code: {}", exitCode);
                new File(backupFilePath).delete(); // Clean up if empty/corrupted
                Map<String, String> errResponse = new HashMap<>();
                errResponse.put("status", "error");
                errResponse.put("message", "Backup utility exited with error code: " + exitCode);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errResponse);
            }
        } catch (Exception e) {
            log.error("Exception during database backup execution", e);
            Map<String, String> errResponse = new HashMap<>();
            errResponse.put("status", "error");
            errResponse.put("message", "Exception occurred: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errResponse);
        }
    }

    /**
     * GET /api/admin/backups/download/{fileName}
     * Streams/downloads a specific backup file.
     */
    @GetMapping("/download/{fileName}")
    public ResponseEntity<Resource> downloadBackup(@PathVariable String fileName) {
        // Prevent path traversal
        if (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        File file = new File(BACKUP_DIR_PATH + "/" + fileName);
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(file);
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + file.getName());
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);

        return ResponseEntity.ok()
                .headers(headers)
                .contentLength(file.length())
                .body(resource);
    }

    /**
     * DELETE /api/admin/backups/{fileName}
     * Deletes a specific backup file.
     */
    @DeleteMapping("/{fileName}")
    public ResponseEntity<Map<String, String>> deleteBackup(@PathVariable String fileName) {
        if (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        File file = new File(BACKUP_DIR_PATH + "/" + fileName);
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        boolean deleted = file.delete();
        Map<String, String> response = new HashMap<>();
        if (deleted) {
            response.put("status", "success");
            response.put("message", "Backup file deleted successfully.");
            return ResponseEntity.ok(response);
        } else {
            response.put("status", "error");
            response.put("message", "Failed to delete backup file.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Parses standard jdbc:postgresql://host:port/dbname formats
     */
    private Map<String, String> parseJdbcUrl(String url) {
        Map<String, String> result = new HashMap<>();
        try {
            String cleanUrl = url.substring("jdbc:postgresql://".length());
            int slashIdx = cleanUrl.indexOf('/');
            String hostPort = cleanUrl.substring(0, slashIdx);
            String dbName = cleanUrl.substring(slashIdx + 1);

            int colonIdx = hostPort.indexOf(':');
            String host = colonIdx > -1 ? hostPort.substring(0, colonIdx) : hostPort;
            String port = colonIdx > -1 ? hostPort.substring(colonIdx + 1) : "5432";

            int paramIdx = dbName.indexOf('?');
            if (paramIdx > -1) {
                dbName = dbName.substring(0, paramIdx);
            }

            result.put("host", host);
            result.put("port", port);
            result.put("database", dbName);
        } catch (Exception e) {
            // Safe fallbacks
            result.put("host", "db-postgres");
            result.put("port", "5432");
            result.put("database", "software_platform");
        }
        return result;
    }
}
