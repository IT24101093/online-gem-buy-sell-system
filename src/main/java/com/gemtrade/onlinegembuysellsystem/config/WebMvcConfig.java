package com.gemtrade.onlinegembuysellsystem.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Keep your existing uploads mapping
        String cleaned = StringUtils.trimWhitespace(uploadDir);
        Path uploadPath = Paths.get(cleaned).toAbsolutePath().normalize();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath.toUri().toString());

        String userDir = System.getProperty("user.dir");
        Path gemPhotosPath = Paths.get(userDir, "src", "main", "resources", "static", "gem-photos");
        String gemPhotosUri = gemPhotosPath.toAbsolutePath().toUri().toString();

        registry.addResourceHandler("/gem-photos/**")
                .addResourceLocations(gemPhotosUri) // Use the file:/// URI instead of classpath
                .setCachePeriod(0);
    }
}