// package org.example;

// import org.springframework.boot.SpringApplication;
// import org.springframework.boot.autoconfigure.SpringBootApplication;
// import org.springframework.context.annotation.ComponentScan;

// @SpringBootApplication
// @ComponentScan(basePackages = {"org.example", "service", "repository", "dto"})
// public class Main {

//     public static void main(String[] args) {
//         SpringApplication.run(Main.class, args);
//     }
// }

package org.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"org.example", "service", "repository", "dto"})
public class Main {

    public static void main(String[] args) {
        SpringApplication.run(Main.class, args);
    }
}