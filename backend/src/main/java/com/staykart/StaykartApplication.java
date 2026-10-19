package com.staykart;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class StaykartApplication implements CommandLineRunner {

    public static void main(String[] args) {
        SpringApplication.run(StaykartApplication.class, args);
    }

    @Override
    public void run(String... args) {
        // Application initialized
    }
}
