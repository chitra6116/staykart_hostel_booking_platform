package com.staykart.common.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Loads environment variables from the project root .env file into the Spring Environment
 * if present. This allows local development without hardcoding credentials in application.yml.
 */
public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        File dotenvFile = findDotenvFile();
        if (dotenvFile == null || !dotenvFile.exists()) {
            return;
        }

        Map<String, Object> dotenvProps = new HashMap<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(dotenvFile, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }
                int eqIdx = line.indexOf('=');
                if (eqIdx > 0) {
                    String key = line.substring(0, eqIdx).trim();
                    String value = line.substring(eqIdx + 1).trim();
                    if ((value.startsWith("\"") && value.endsWith("\"")) ||
                        (value.startsWith("'") && value.endsWith("'"))) {
                        if (value.length() >= 2) {
                            value = value.substring(1, value.length() - 1);
                        }
                    }
                    dotenvProps.put(key, value);
                }
            }
        } catch (IOException ignored) {
            // If reading fails, ignore and let other sources take over
        }

        // Convenience mapping: if SPRING_DATASOURCE_PASSWORD not explicitly provided, map from POSTGRES_PASSWORD
        if (!dotenvProps.containsKey("SPRING_DATASOURCE_PASSWORD") && dotenvProps.containsKey("POSTGRES_PASSWORD")) {
            dotenvProps.put("SPRING_DATASOURCE_PASSWORD", dotenvProps.get("POSTGRES_PASSWORD"));
        }

        if (!dotenvProps.isEmpty()) {
            environment.getPropertySources().addLast(new MapPropertySource("dotenvProperties", dotenvProps));
        }
    }

    private File findDotenvFile() {
        String[] candidatePaths = {
            ".env",
            "../.env",
            "../../.env",
            System.getProperty("user.dir") + File.separator + ".env",
            System.getProperty("user.dir") + File.separator + ".." + File.separator + ".env"
        };

        for (String path : candidatePaths) {
            File f = new File(path);
            if (f.exists() && f.isFile()) {
                return f;
            }
        }
        return null;
    }
}
