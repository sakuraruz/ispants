package org.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

// ДОБАВЛЕН ПАРАМЕТР scanBasePackages
@SpringBootApplication(scanBasePackages = {"org.example", "service", "repository", "dto"})
@RestController
public class Main {

    public static void main(String[] args) {
        SpringApplication.run(Main.class, args);
    }

    @GetMapping("/")
    public String hello() {
        return "Привет, аналитический инструмент работает!";
    }
}