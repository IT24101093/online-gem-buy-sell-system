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
        // This makes the /uploads/** URL show files from the local uploads folder,
        // so saved images can be opened in the browser and used by the frontend.
        String cleaned = StringUtils.trimWhitespace(uploadDir);
        Path uploadPath = Paths.get(cleaned).toAbsolutePath().normalize();

        // Map URL: /uploads/**  ->  Local folder: uploads/
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath.toUri().toString());
    }
}