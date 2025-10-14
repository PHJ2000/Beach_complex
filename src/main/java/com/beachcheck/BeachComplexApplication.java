package com.beachcheck;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BeachComplexApplication {

    public static void main(String[] args) {
        SpringApplication.run(BeachComplexApplication.class, args);
    }
}
